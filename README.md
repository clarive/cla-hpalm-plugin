# HP ALM Plugin

The HP ALM plugin will allow you to keep topics from HP ALM Octane synchronized with Clarive and vice versa.

# What is HP ALM
HP Application Lifecycle Management (HP ALM) is a set of software tools developed and marketed by the HP Software
Division of Hewlett Packard Enterprise for application development and testing.

## Installation

To install the plugin, place the `cla-hpalm-plugin folder` inside the `CLARIVE_BASE/plugins` directory in your Clarive
instance.

## How to use

Once the plugin is placed in its folder and Clarive has been restarted, you can start using it by going to your Clarive
instance.

You will have two new resources, one for the HP ALM server and another for the HP ALM category correspondence.  Also,
you will have two new palette services. The outbound one is used when you modify something in Clarive and information
needs to be sent to HP ALM, and other one in order to receive information on HP ALM changes.

### HP ALM Server

This Resource is used to save your HP ALM Server settings:

- **Username **- Your HP ALM username.
- **Password **- Your HP ALM password.
- **Shared Space ID **- The ID number of the HP ALM shared space.
- **Workspace **- The name of the HP ALM workspace.
- **Login URL **- This is the URL the plugin will try to connect to, with the default value set to
  https://mqast001pngx.saas.hpe.com/authentication/sign_in

Example:

        Username: TestUser
        Password: UserPwd
        Shared Space ID: 12390
        Workspace: default_workspace
        Login URL: https://mqast001pngx.saas.hpe.com/authentication/sign_in

### HP ALM Category

This Resource will synchronize any Clarive topic you choose with the desired HP ALM topic. That way, when you create
(update or delete) a topic of this type, the same action will be performed in the other side.

- **HP ALM Octane Category Name **- The internal name of the topic you are going to create in HP ALM.
- **Clarive Category Name **- The name in Clarive of the topic category you would like to be counterpart of the HP ALM
  topic.
- **Clarive - HP ALM Octane Field Correspondence **- The fields you wish to share between the two services must have
  their correspondence here, with Clarive field names written to the left, and HP ALM field names written to the right.
Clarive names must be the `id_field` name you have used in the form rule associated with the topic, and HP ALM names
must be the id names of the fields you wish to correspond.
- **Clarive - HP ALM Octane Field List Correspondence **- Here you will write a list for the field with multiple
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


## Palette Services

### HP ALM Inbound

This palette service will perform an HP ALM action in Clarive. You need to place this palette service in a Webservice
rule.

Also you will need to set the Call URL rule in the phase you would like to keep this synchronization between Clarive and
HP ALM.  To call the service where the Inbound service is located, the URL should be as follows: `<your Clarive
url>/rule/ws/<inboundCreateRule>?api_key=<your API Key in Clarive>`, therefore you need to obtain a Clarive user API
key.  Remember that you will need the HP ALM integration bridge to be able to make the Call URL rules in HP ALM.

Service settings

- **HP ALM Server **- server with the user data from HP ALM that will create the topic in Clarive.
- **HP ALM Category **- The HP ALM category where correspondences are defined.

### HP ALM Outbound

Use this service to perform an action remotely from Clarive. The *Delete* event must be of type "pre-online", and
*Create*, *Change status* and *Update* events must be "post-online".

Service settings:

- **HP ALM Server **- server with the user data from HP ALM that will create the topic in Clarive.
- **Action **- the action to be performed. This can be Create, Update, Delete or Change Status.
- **HP ALM Category **- The HP ALM category where the correspondences are defined.
