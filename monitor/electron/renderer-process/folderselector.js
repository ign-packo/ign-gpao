  {
     let myName = document.currentScript.getAttribute('name');
     const ipc       = require('electron').ipcRenderer;

     let  asyncBtn  = document.querySelector('#folder-selector-'+myName);
     let replyField = document.querySelector('#folder-selector-content-'+myName);
     let onButtonClick = function() {
         const { dialog } = require('electron').remote;
         let dialogOptions = {
           title: "Choisir un dossier:",
           properties: ['openDirectory','promptToCreate'],
         };
         dialog.showOpenDialog(
             dialogOptions,
             fileNames => {
               if (fileNames === undefined) {
                 console.log("No file selected");
               } else {
                 console.log('file:', fileNames[0]);
                 replyField.value = fileNames[0];
               }
         })
     };

     asyncBtn.addEventListener("click", onButtonClick);
 }
