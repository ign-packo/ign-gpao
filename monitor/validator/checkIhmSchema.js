const { Validator } = require('jsonschema');

function validate(ihm_data) {
    // AB : source => https://www.npmjs.com/package/jsonschema
    const v = new Validator();
    
    
    //schema LineEdit
    const lineedit_schema = {
        'type': 'object',
        'properties': {
            'Name': {
                'type': 'string',
                'required': true
            },
            'Key': {
                'type': 'string',
                'required': true
            },
            'Value': {
                'type': 'string',
                'required': true
            },
            'DefaultValue': {
                'type': 'string'
            },
            'ValueType': {
                'type': 'string',
                'pattern': 'Double|Path|String|Integer',
            },
            'ToolTip': {
                'type': 'string'
            },
            'Type': {
                'type': 'string',
                'pattern': '^LineEdit$',
                'required': true
            }
        }
    }
    v.addSchema(lineedit_schema, '/LineEdit');
    
    //schema CheckBox
    const checkbox_schema = {
        'type': 'object',
        'properties': {
            'Name': {
                'type': 'string',
                'required': true
            },
            'Key': {
                'type': 'string',
                'required': true
            },
            'Value': {
                'type': 'boolean',
                'required': true
            },
            'DefaultValue': {
                'type': 'boolean'
            },
            'ValueType': {
                'type': 'string',
                'pattern': '^Boolean$',
            },
            'ToolTip': {
                'type': 'string'
            },
            'Type': {
                'type': 'string',
                'pattern': '^CheckBox$',
                'required': true
            }
        }
    }
    v.addSchema(checkbox_schema, '/CheckBox');
    
    
    //schema Label
    const label_schema = {
        'type': 'object',
        'properties': {
            'Name': {
                'type': 'string',
                'required': true
            },
            'Type': {
                'type': 'string',
                'pattern': '^Label$',
                'required': true
            }
        }
    }
    v.addSchema(label_schema, '/Label');
    
    
    
    //schema ButtonGroup
    const buttongroup_schema = {
        'type': 'object',
        'properties': {
            'Name': {
                'type': 'string'
            },
            'Key': {
                'type': 'string',
                'pattern': '^[A-Za-z0-9\s]+$',
                'required': true
            },
            'Type': {
                'type': 'string',
                'pattern': '^ButtonGroup$',
                'required': true
            },
            'content': {
                'type': 'array',
                'required': true,
                'items': '/RadioButton'
            }
        }
    }
    v.addSchema(buttongroup_schema, '/ButtonGroup');
    
    //schema RadioButton
    const radiobutton_schema = {
        'properties': {
            'Name': {
                'type': 'string',
                'required': true
            },
            'Key': {
                'type': 'string',
                'required': true
            },
            'Value': {
                'type': 'boolean',
                'required': true
            },
            'DefaultValue': {
                'type': 'boolean'
            },
            'ValueType': {
                'type': 'string',
                'pattern': '^Boolean$',
            },
            'ToolTip': {
                'type': 'string'
            },
            'Type': {
                'type': 'string',
                'pattern': '^RadioButton$',
                'required': true
            }
        }
    }
    v.addSchema(radiobutton_schema, '/RadioButton');
    
    //schema FileSelector
    const fileselector_schema = {
        'properties': {
            'Name': {
                'type': 'string'
            },
            'Key': {
                'type': 'string',
                'required': true
            },
            'Value': {
                'type': 'string'
            },
            'DefaultValue': {
                'type': 'string'
            },
            'ValueType': {
                'type': 'string',
                'pattern': '^FilePath$',
            },
            'ToolTip': {
                'type': 'string'
            },
            'Type': {
                'type': 'string',
                'pattern': '^FileSelector$',
                'required': true
            }
        }
    }
    v.addSchema(fileselector_schema, '/FileSelector');
    
    //schema FolderSelector
    const folderselector_schema = {
        'properties': {
            'Name': {
                'type': 'string'
            },
            'Key': {
                'type': 'string',
                'required': true
            },
            'Value': {
                'type': 'string'
            },
            'DefaultValue': {
                'type': 'string'
            },
            'ValueType': {
                'type': 'string',
                'pattern': '^Path$',
            },
            'ToolTip': {
                'type': 'string'
            },
            'Type': {
                'type': 'string',
                'pattern': '^FolderSelector$',
                'required': true
            }
        }
    }
    v.addSchema(folderselector_schema, '/FolderSelector');
    
    //schema ComboBox
    const combobox_schema = {
        'properties': {
            'Name': {
                'type': 'string'
            },
            'Key': {
                'type': 'string',
                'required': true
            },
            'Value': {
                'type': 'string'
            },
            'DefaultValue': {
                'type': 'string'
            },
            'ValueType': {
                'type': 'string',
                'pattern': '^String$',
            },
            'ToolTip': {
                'type': 'string'
            },
            'Type': {
                'type': 'string',
                'pattern': '^ComboBox$',
                'required': true
            }
        }
    }
    v.addSchema(combobox_schema, '/ComboBox');
    
    //schema Group
    const group_schema = {
        'type': 'object',
        'properties': {
            'Name': {
                'type': 'string'
            },
            'Key': {
                'type': 'string'
            },
            'Type': {
                'type': 'string',
                'pattern': '^Group$',
                'required': true
            },
            'GroupType': {
                'type': 'string',
                'pattern': 'VerticalGroup|HorizontalGroup'
            },
            'content': {
                'type': 'array',
                'items': {
                    'anyOf': ['/LineEdit', '/Group', '/Label', '/ButtonGroup', '/FolderSelector', '/FileSelector', '/CheckBox', '/ComboBox']
                }
            }
        }
    }
    v.addSchema(group_schema, '/Group');
    
    //schema Page
    const page_schema = {
        'type': 'object',
        'properties': {
            'Name': {
                'type': 'string'
            },
            'Key': {
                'type': 'string'
            },
            'Type': {
                'type': 'string',
                'pattern': '^Page$',
                'required': true
            },
            'content': {
                'type': 'array',
                'required': true,
                'items': {
                    'anyOf': ['/LineEdit', '/Group', '/Label', '/ButtonGroup', '/FolderSelector', '/FileSelector', '/CheckBox', '/ComboBox']
                }
            }
        }
    }
    v.addSchema(page_schema, '/Page');
    
    //schema Dependencies
    const dependency_schema = {
        'properties': {
            'Master': {
                'type': 'string',
                'required': true
            },
            'Slave': {
                'type': 'string',
                'required': true
            },
            'Inverse': {
                'type': 'boolean'
            },
            'Type': {
                'type': 'string',
                'pattern': '^Dependency$',
                'required': true
            }
        }
    }
    v.addSchema(dependency_schema, '/Dependency');
    
    
    //schema environment
    const env_schema = {
        'properties': {
            'name': {
                'type': 'string',
                'required': true
            },
            'value': {
                'type': 'string',
                'required': true
            }
        }
    }
    v.addSchema(env_schema, '/Environment');
    
    
    //schema command
    const cmd_schema = {
        'properties': {
            'execute': {
                'type': 'string',
                'required': true
            }
        }
    }
    v.addSchema(cmd_schema, '/Command');
    
    //schema on_create
    const oncreate_schema = {
        'properties': {
            'directory': {
                'type': 'string',
                'required': true
            },
            'environment': {
                'type': 'array',
                'items': '/Environment'
            },
            'commands': {
                'type': 'array',
                'items': '/Command'
            }
        }
    }
    v.addSchema(oncreate_schema, '/Create');
    
    // Schema json ihm
    const ihm_schema = {
        'type': 'object',
        'required': ['ihm', 'page', 'js_folder'],
        'properties': {
            'ihm': {
                'type': 'object',
                'required': true,
                'properties': {
                    'content': {
                        'type': 'array',
                        'required': true,
                        'items': '/Page'
                    },
                    'dependencies': {
                        'type': 'array',
                        'items': '/Dependency'
                    },
                    'oncreate': {
                        'type': '/Create'
                    }
                },
                'page': {
                    'type': 'string',
                    'required': true
                },
                'js_folder': {
                    'type': 'string',
                    'required': true
                }
            }
        }
    }
    
    return v.validate(ihm_data, ihm_schema);
};

module.exports = {
    validate
};
