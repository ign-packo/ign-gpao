{
    let  asyncBtn  = document.querySelector('#'+document.currentScript.getAttribute('name'));
    let myForm = undefined;
    
    for (var i = 0; i < document.getElementsByTagName("form").length; i++) {
        let elem = document.getElementsByTagName("form")[i];
        if (elem.hasAttribute('class')){
            if (elem.getAttribute('class') == document.currentScript.getAttribute('params')) {
                myForm = elem;
            }
        }
    }
    
    function readValue (object)
    {
        verbose = false;
        if (verbose) console.log('object:', object);
        if (verbose) console.log('tagName:', object.tagName);
        if (object.tagName.toLowerCase() == 'input')
        {
           if (object.hasAttribute('type'))
           {
               var type = object['type'].toLowerCase();
               if (type == 'checkbox')
               {
                   return object.checked;
               } else  if (type == 'text')
               {
                   return object.value;
               } else  if (type == 'radio')
               {
                   return object.value;
               } else
               {
                    return object.value;
               }
           }
        }
        else if (object.tagName.toLowerCase() == 'select')
        {
            return object.value;
        }
        return object.value;
    }
    
    function append(array1, array2)
    {
        count = array1.length;
        for (var i in array2)
        {
            array1[count]=array2[i];
            count = count +1;
        }
    }
    
    let onButtonClick = function() {
        const { dialog, currentWindow } = require('electron').remote;

        let options = {
            //Placeholder 1
        title: "sauvegarder les parametres",
            buttonLabel : "sauvegarder",
            filters :[  {name: 'Json file', extensions: ['json']}  ]
        }
        if (myForm == undefined)
        {
            dialog.showErrorBox('Oops! Something went wrong!', 'Help us improve your experience by sending an error report')
        }
        var inputs = myForm.querySelectorAll('input');
        append(inputs, myForm.querySelectorAll('select'));
        var jsonData = {};
        console.log('number of inputs:', inputs.length);
        for (var i = 0; i < inputs.length; i++)
        {
            if (inputs[i].hasAttribute("name"))
            {
                jsonData[inputs[i]["name"]] = readValue(inputs[i]);
            }
        }

        var fs = require('fs');
        dialog.showSaveDialog(currentWindow, options).then(result => {
        if(result.canceled == false) {
             jsonParams={};
             jsonParams['parameters'] = jsonData;
               try {
                 fs.writeFileSync(result.filePath, JSON.stringify(jsonParams, null, '\t'), 'utf-8');
               }
               catch(e) {
                 console.log('cannot save file ', filename);
               }
         }
        }).catch(err => {
          console.log(err)
        })
        
    
    };
                        
  asyncBtn.addEventListener("click", onButtonClick);
}
