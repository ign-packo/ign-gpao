module.exports = function(project){
    // AB : source => https://www.npmjs.com/package/jsonschema
    var Validator = require('jsonschema').Validator
    var v = new Validator()

    //Schema Arnaud
    var schema = {
        "type": "object",
        "required": ["projects"],
        "properties":{
            "projects":{
                "type": "array",
                "items":{
                    "required": ["jobs"],
                    "properties":{
                        "name":{
                            "type": "string"
                        },
                        "jobs":{
                            "type":  "array",
                            "items":{
                                "required": ["name", "command"],
                                "properties":{
                                    "name":{
                                        "type": "string"
                                    },
                                    "command":{
                                        "type": "string"
                                    },
                                    "deps":{
                                        "type": "array",
                                        "items":{
                                            "properties":{
                                                "id":{
                                                    "type": "integer"
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        "deps":{
                            "type": "array",
                            "items":{
                                "properties":{
                                    "id":{
                                        "type": "integer"
                                    }
                                }
                            }
                        }
                    }
                } 
            }
        }
    }
    
    // Schema Greg
    /*var schema = {
        "type": "object",
        "required": ["projects","jobs"],
        "properties":{
            "projects":{
                "type": "array",
                "items": {
                    "required": ["name"],
                    "properties": {
                        "name": { 
                            "type": "string" 
                        }
                    }
                }
            },
            "jobs":{
                "type": "array",
                "items": {
                    "required": ["name","command","id_project"],
                    "properties": {
                        "name": { 
                            "type": "string" 
                        },
                        "command": { 
                            "type": "string" 
                        },
                        "id_project": { 
                            "type": "integer" 
                        }
                    }
                }
            },
            "jobDependencies":{
                "type": "array",
                "items": {
                    "required": ["upstream","downstream"],
                    "properties": {
                        "upstream": { 
                            "type": "integer" 
                        },
                        "downstream": { 
                            "type": "integer" 
                        }
                    }
                }
            },
            "projectDependencies":{
                "type": "array",
                "items": {
                    "required": ["upstream","downstream"],
                    "properties": {
                        "upstream": { 
                            "type": "integer" 
                        },
                        "downstream": { 
                            "type": "integer" 
                        }
                    }
                }
            }
        }
    }*/
    
    return v.validate(project, schema).valid
}