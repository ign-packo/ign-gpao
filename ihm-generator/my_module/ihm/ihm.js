var VERBOSE=false;

function buildHtml(myContent) {
    
    var header = '';
    var html = '<!DOCTYPE html>'  + '<html><head>' + header + '</head>\n';
//    html += '<meta charset="utf-8">\n';
//    html += '<meta name="viewport" content="width=device-width, initial-scale=1">\n';
    
    html += '<body>\n';
    html += '<form action="getParams" method="post" class="gpao-params">\n';
    
    html += parse(myContent, '');
    
    html += '<button >Créer le chantier</button>\n';
//    html += '<input type="submit" value="post">Créer le chantier</input>\n';
    html += '</form>\n';
    html += '</body>\n';

/*
    html += '<div class="container"> <br />';
    html += '<div class="btn-container">';
    html += '<button type="submit" onclick="exportUserData()">Créer la gpao</button>';
    html += '</div>';
    html += '</div>';
*/
    html += '</html>';
    
    return html;
};

exports.buildHtml = buildHtml;

///
///
///
function parse(myContent, indent) {
    
    if (VERBOSE)
    {
        if ( myContent.hasOwnProperty('Name'))
            console.log(indent, 'Name: ', myContent['Name']);
        if ( myContent.hasOwnProperty('Type'))
            console.log(indent, 'Type: ', myContent['Type']);
        if ( myContent.hasOwnProperty('Value'))
            console.log(indent, 'Value: ', myContent['Value']);
    }
    
    var html = '';
    if ( myContent.hasOwnProperty('content'))
    {
        if (VERBOSE) console.log(indent, 'object has children');
        let subcontent=myContent['content'];
//        console.log('subcontent of ', myContent['Name'],':', subcontent.length);
        if (subcontent.length != 0)
        {
            let myKey = '';
            for(myKey in subcontent) {
                let entry = subcontent[myKey];
                if (entry == undefined)
                {
                    console.log('entry',myKey,'from ',  myContent['Name'], 'undefined??');
                    console.log('subcontent of ', myContent['Name'],': ', subcontent, subcontent.length);
                    break;
                }
                if ( !entry.hasOwnProperty('Type'))
                {
                    console.log('impossible de lire ', entry);
                    continue;
                }
                var myType = entry['Type'];
                
                if (myType == 'Page')
                {
                    html += BuildPage(entry, indent);
                }
                else  if (myType == 'Group')
                {
                    html += BuildGroup(entry, indent);
                }
                else  if (myType == 'Label')
                {
                      html += BuildLabel(entry, indent);
                }
                else  if (myType == 'LineEdit')
                {
                      html += BuildLineEdit(entry, indent);
                }
                else  if (myType == 'ComboBox')
                {
                    html += BuildComboBox(entry, indent);
                }
                else  if (myType == 'ButtonGroup')
                {
                    html += BuildButtonGroup(entry, indent);
                }
                else  if (myType == 'CheckBox')
                {
                    html += BuildCheckBox(entry, indent);
                }
                else  if (myType == 'RadioButton')
                {
                    html += BuildRadioButton(entry, indent);
                }
                else  if (myType == 'FileSelector')
                {
                    html += BuildFileSelector(entry, indent);
                }
                else  if (myType == 'FolderSelector')
                {
                    html += BuildFolderSelector(entry, indent);
                }
            }
        }
    }
    return html;
}

///
///
///
function BuildGroup(entry, indent){
    if (VERBOSE) console.log(indent, 'BuildGroup ' + entry['Name']);
    
    var name = '';
    if ( entry.hasOwnProperty('Name'))
        name = entry['Name'];
    
    var html = '<fieldset>\n<legend>' + name + '</legend>\n';

    if ( entry.hasOwnProperty('content'))
    {
         html += parse(entry, indent + '    ');
    }
   html+='</fieldset>\n';
   return html;
}

///
///
///
function BuildPage(entry, indent){
    
    if (VERBOSE) console.log(indent, 'BuildPage ' + name);
    
    var name = '';
    if ( entry.hasOwnProperty('Name'))
        name = entry['Name'];
    
    var html = '<fieldset>\n<legend>' + 'PAGE ' + name + '</legend>\n';
    if ( entry.hasOwnProperty('content'))
    {
         html += parse(entry, indent + '    ');
    }
    html+='</fieldset>\n';
    return html;
}

///
///
///
function BuildLabel(entry, indent){
    if (VERBOSE) console.log(indent, 'BuildLabel ' + entry['Name']);
    var html = '<label>' + entry['Name'] + '</label>\n';
    return html;
}

///
///
///
function BuildLineEdit(entry, indent){
    if (VERBOSE) console.log(indent, 'BuildLineEdit ' + entry['Name']);

    var html = '<div class="gpao-params">\n';
    html += '<label>' + entry['Name'] + '</label>\n';
    html += '<input type="text" value="' + entry['Value'] + '" name="' + entry['Name'] + '"></input>\n';
    html += '</div>';

    return html;
}

///
///
///
function BuildComboBox(entry, indent){
    if (VERBOSE) console.log(indent, 'BuildComboBox ' + entry['Name']);
    
    var html = '<div class="gpao-params">\n';

    html += '<input type="text" list="' + entry['Key'] + '"/>\n';
    html += '<datalist id="' + entry['Key'] + '">\n';
    
    const options = entry['Value'].split(';');
    for (var i = 0; i < options.length; i++)
    {
       html += '<option value="' + options[i] + '">' + options[i] + '</option>\n';
    }
    html += '</datalist>';
    html += '</div>';
    /*
    var html = '<label for="' + entry['Key'] + '">' + entry['Name']+':</label>\n';
    html += '<select id="' + entry['Key']+'">\n';

    const options = entry['Value'].split(';');
    var i = 0;
    for (i = 0; i < options.length; i++)
    {
       html += '<option value="' + options[i] + '">' + options[i] + '</option>\n';
    }
     html += '</select>\n';
     */
    return html;
}

///
///
///
function BuildButtonGroup(entry, indent){
    if (VERBOSE) console.log(indent, 'BuildButtonGroup ' + entry['Name']);
    
    var html = '<p>' + entry['Name'] + '</p>';
    if ( !entry.hasOwnProperty('content'))
    {
        console.log(indent, 'ButtonGroup without content ' + entry['Name']);
        return process.exit(-1);
    }
    if ( !entry.hasOwnProperty('Key'))
    {
         console.log(indent, 'ButtonGroup without compulsory attribute "Key" ' + entry['Name']);
        return process.exit(-1);
    }

   content =  entry['content'];
   for(var myKey in content) {
       sub_entry = content[myKey];

       html += '<div class="gpao-params">\n';

       if (sub_entry['Value'] == true)
           html += '<input type="radio" id="' + sub_entry['Key'] + '" name="' + entry['Key'] + '" value="' + sub_entry['Key'] + '" checked>\n';
       else
           html += '<input type="radio" id="' + sub_entry['Key'] + '" name="' + entry['Key'] + '" value="' + sub_entry['Key'] + '">\n';
       
       html += '<label for="' + sub_entry['Key'] + '">' + sub_entry['Name'] + '</label>\n';
       
       html += '</div>\n';
   }

    return html;
}


function BuildCheckBox(entry, indent){
    
    if (VERBOSE) console.log(indent, 'BuildCheckBox ' + entry['Name']);
    var html = '<div class="gpao-params">\n';
    //var html = '';
    html += '<label for="' + entry['Key'] + '">' + entry['Name'] + '</label>\n';
    if (entry['Value'] == 'true')
        html += '<input type="checkbox" id="' + entry['Key'] + '" name="' + entry['Name'] + '" checked>\n';
    else
        html += '<input type="checkbox" id="' + entry['Key'] + '" name="' + entry['Name'] + '">\n';

    html += '</div>\n';

    return html;

}

///
///
///
function BuildRadioButton(entry, indent){
    if (VERBOSE) console.log(indent, 'BuildRadioButton ' + entry['Name']);
    return process.exit(-1);
}

///
///
///
function BuildFileSelector(entry, indent){
    if (VERBOSE) console.log(indent, 'BuildFileSelector ' + entry['Name']);
    
    var html = '<div class="gpao-params">\n';
    html += '<label for="' + entry['Key'] + '">' + entry['Name'] + '</label>\n';
    html += '<input type="file" id="' + entry['Key'] + '" name="' + entry['Name'] +'">\n';
    html += '</div>\n';

    return html;
}

///
///
///
function BuildFolderSelector(entry, indent){
    if (VERBOSE) console.log(indent, 'BuildFolderSelector ' + entry['Name']);
        
    var html = '<div class="gpao-params">\n';
    html += '<label for="' + entry['Key'] + '">' + entry['Name'] + '</label>\n';
    html += '<input type="file" id="' + entry['Key'] + '" name="' + entry['Name'] +'" webkitdirectory directory/>\n';
    html += '</div>\n';
    
    return html;
}
