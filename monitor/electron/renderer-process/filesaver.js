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
        var jsonData = {};
        for (var i = 0; i < inputs.length; i++)
        {
            if (inputs[i].hasAttribute("name"))
            {
                jsonData[inputs[i]["name"]] = inputs[i].value;
            }
        }
        
        // on gere a part les combobox (bog avec input text / datalist)
        var selects = myForm.querySelectorAll('select');
        for (var i = 0; i < selects.length; i++)
        {
            if (selects[i].hasAttribute("name"))
            {
                jsonData[selects[i]["name"]] = selects[i].value;
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
