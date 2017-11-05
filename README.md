# HP ALM Plugin

<img src="https://cdn.rawgit.com/clarive/cla-hpalm-plugin/master/public/icon/hpalm.svg?sanitize=true" alt="HP ALM Plugin" title="HP ALM Plugin" width="120" height="120">

The HP ALM plugin will allow you to keep topics from HP ALM Octane synchronized with Clarive and vice versa.

## What is HP ALM
HP Application Lifecycle Management (HP ALM) is a set of software tools developed and marketed by the HP Software
Division of Hewlett Packard Enterprise for application development and testing.

## Installation

To install the plugin, place the `cla-hpalm-plugin` folder inside the `$CLARIVE_BASE/plugins` directory in your Clarive
instance.

### HP ALM Server

To configurate the HPALM Server Resource open:

In **Clarive SE**: Resources -> ClariveSE.

In **Clarive EE**: Resources -> HPALM.

This Resource is used to save your HP ALM Server settings:

- **Username**- Your HP ALM username.
- **Password**- Your HP ALM password.
- **Shared Space ID**- The ID number of the HP ALM shared space.
- **Workspace**- The name of the HP ALM workspace.
- **Login URL**- This is the URL the plugin will try to connect to, with the default value set to
  https://mqast001pngx.saas.hpe.com/authentication/sign_in


Example:

        Username: TestUser
        Password: UserPwd
        Shared Space ID: 12390
        Workspace: default_workspace
        Login URL: https://mqast001pngx.saas.hpe.com/authentication/sign_in

### HP ALM Category

To configurate the HPALM Category Resource open:

In **Clarive SE**: Resources -> ClariveSE.

In **Clarive EE**: Resources -> HPALM.

This Resource will synchronize any Clarive topic you choose with the desired HP ALM topic. That way, when you create
(update or delete) a topic of this type, the same action will be performed in the other side.

- **HP ALM Octane Category Name**- The internal name of the topic you are going to create in HP ALM.
- **Clarive Category Name**- The name in Clarive of the topic category you would like to be counterpart of the HP ALM
  topic.
- **Clarive - HP ALM Octane Field Correspondence**- The fields you wish to share between the two services must have
  their correspondence here, with Clarive field names written to the left, and HP ALM field names written to the right.
Clarive names must be the `id_field` name you have used in the form rule associated with the topic, and HP ALM names
must be the id names of the fields you wish to correspond.
- **Clarive - HP ALM Octane Field List Correspondence**- Here you will write a list for the field with multiple
  correspondences within it (such as status). You therefore need to have the field value in the previous table, and
define here the Clarive value with the correspondence list between Clarive and HP ALM IDs. Correspondences are separated
by , and relations marked with *:* (Clarive_id:HP-ALM_ID).

Example:

    HP ALM Octane Category Name:        Defect
    Clarive Category Name:              Defect
    Clarive - HP ALM Octane Field Correspondence:
        - description                       description
        - status                            phase
        - title                             name
        
    Clarive - HP ALM Octane Field List Correspondence:
        - status: 2:1001,22:1002,status-45:1003 

### HP ALM Inbound

The various parameters are:

- **HP ALM Server (variable name: server)**- Server with the user data from HP ALM that will create the topic in Clarive.
- **HP ALM Category (hpalm_category)**- The HP ALM category where correspondences are defined.

Also you will need to set the Call URL rule in the phase you would like to keep this synchronization between Clarive and
HP ALM.  To call the service where the Inbound service is located, the URL should be as follows: `<your Clarive
url>/rule/ws/<inboundCreateRule>?api_key=<your API Key in Clarive>`, therefore you need to obtain a Clarive user API
key.  Remember that you will need the HP ALM integration bridge to be able to make the Call URL rules in HP ALM.

### HP ALM Outbound

The various parameters are:

- **HP ALM Server (server)**- server with the user data from HP ALM that will create the topic in Clarive.
- **Action (synchronize_when)**- the action to be performed. This can be Create, Update, Delete or Change Status.
- **HP ALM Category (hpalm_category)**- The HP ALM category where the correspondences are defined.

Use this service to perform an action remotely from Clarive. The *Delete* event must be of type "pre-online", and
*Create*, *Change status* and *Update* events must be "post-online".

NOTE: The **Delete** op is only available in Clarive EE.

## How to use

### In Clarive EE

Once the plugin is placed in its folder, you can find this service in the palette in the section of generic service and can be used like any other palette op.

Outbound example:

```yaml
    HP ALM Server: HPALM server
    Action: Create
    HP ALM Category: HPALM categories
``` 

Inbound example:

```yaml
    HP ALM Server: HPALM server
    HP ALM Category: HPALM categories
``` 

### In Clarive SE

#### Rulebook

If you want to use the plugin through the Rulebook, in any `do` block, use this ops as examples to configure the different parameters:

Outbound example:

```yaml
do:
   - hpalm_outbound:
       server: 'hpalm_resource'                # Required. Use the mid set to the resource you created 
       synchronize_when: 'create'              # Required.
       hpalm_category: 'category_resource'     # Required. Use the mid set to the resource you created 
``` 

Inbound example:

```yaml
do:
   - hpalm_inbound:
       server: 'hpalm_resource'                # Required. Use the mid set to the resource you created
       hpalm_category: 'category_resource'     # Required. Use the mid set to the resource you created 
```

##### Outputs

###### Success

The service will return the response from the HPALM API.

###### Possible configuration failures

**Task failed**

You will get the error from the HPALM API.

**Variable required**

```yaml
Error in rulebook (compile): Required argument(s) missing for op "hpalm_inbound": "server"
```

Make sure you have all required variables defined.

**Not allowed variable**

```yaml
Error in rulebook (compile): Argument `Category` not available for op "hpalm_outbound"
```

Make sure you are using the correct paramaters (make sure you are writing the variable names correctly).

## More questions?

Feel free to join **[Clarive Community](https://community.clarive.com/)** to resolve any of your doubts.
