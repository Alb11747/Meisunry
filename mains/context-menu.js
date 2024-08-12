const contextMenu = require('electron-context-menu');
const { app, clipboard, dialog, shell } = require('electron');
const fs = require('fs');
const { loadFolder, saveAppData, loadData, loadIndex } = require('./main-functions');
let trash;
import('trash').then((trashModule) => { trash = trashModule.default || trashModule; });

contextMenu({
  prepend: (defaultActions, parameters, browserWindow) => { 
    const hasImage = !(parameters.srcURL === null || parameters.srcURL === '');
  return [
  {
    label: 'Sort By',
    type: 'submenu',
    submenu: [
    {
      click: () => { 
        global.preferencesData.sortMode = 'newest';
        saveAppData();
        browserWindow.webContents.send('sort-update'); 
      },
      label: 'Newest',
      type: 'checkbox',
      checked: global.preferencesData.sortMode == 'newest',
    },
    {
      click: () => { 
        global.preferencesData.sortMode = 'oldest';
        saveAppData();
        browserWindow.webContents.send('sort-update'); 
      },
      label: 'Oldest',
      type: 'checkbox',
      checked: global.preferencesData.sortMode == 'oldest',
    },
    {
      click: () =>  { 
        global.preferencesData.sortMode = 'name-a';
        saveAppData();
        browserWindow.webContents.send('sort-update'); 
      },
      label: 'Name A->Z',
      type: 'checkbox',
      checked: global.preferencesData.sortMode == 'name-a',
    },
    {
      click: () =>  { 
        global.preferencesData.sortMode = 'name-z';
        saveAppData();
        browserWindow.webContents.send('sort-update'); 
      },
      label: 'Name Z->A',
      type: 'checkbox',
      checked: global.preferencesData.sortMode == 'name-z',
    },
    {
      click: () =>  { 
        global.preferencesData.sortMode = 'type-a';
        saveAppData();
        browserWindow.webContents.send('sort-update'); 
      },
      label: 'Type A->Z',
      type: 'checkbox',
      checked: global.preferencesData.sortMode == 'type-a',
    },
    {
      click: () =>  { 
        global.preferencesData.sortMode = 'type-z';
        saveAppData();
        browserWindow.webContents.send('sort-update'); 
      },
      label: 'Type Z->A',
      type: 'checkbox',
      checked: global.preferencesData.sortMode == 'type-z',
    },
    {
      click: () =>  { 
        global.preferencesData.sortMode = 'random';
        saveAppData();
        browserWindow.webContents.send('sort-update'); 
      },
      label: 'Random',
      type: 'checkbox',
      checked: global.preferencesData.sortMode == 'random',
    },
    ]
  },

  {
    label: `Set Recursion Depth`,
    type: 'submenu',
    submenu: [
      {
        click: () => { 
          global.preferencesData.recursion = 0;
          saveAppData();
          loadIndex(browserWindow);
        },
        label: 'No recursion',
        type: 'checkbox',
        checked: global.preferencesData.recursion == 0,
      },
      {
        click: () => { 
          global.preferencesData.recursion = 1;
          saveAppData();
          loadIndex(browserWindow);
        },
        label: '1 Folder Deep',
        type: 'checkbox',
        checked: global.preferencesData.recursion == 1,
      },
      {
        click: () => { 
          global.preferencesData.recursion = 2;
          saveAppData();
          loadIndex(browserWindow);
        },
        label: '2 Folders Deep',
        type: 'checkbox',
        checked: global.preferencesData.recursion == 2,
      },
      {
        click: () => { 
          global.preferencesData.recursion = 3;
          saveAppData();
          loadIndex(browserWindow);
        },
        label: '3 Folders Deep',
        type: 'checkbox',
        checked: global.preferencesData.recursion == 3,
      },
      {
        click: () => { 
          global.preferencesData.recursion = 4;
          saveAppData();
          loadIndex(browserWindow);
        },
        label: '4 Folders Deep',
        type: 'checkbox',
        checked: global.preferencesData.recursion == 4,
      },
      {
        click: () => { 
          global.preferencesData.recursion = 5;
          saveAppData();
          loadIndex(browserWindow);
        },
        label: '5 Folders Deep',
        type: 'checkbox',
        checked: global.preferencesData.recursion == 5,
      },
      {
        click: () => { 
          global.preferencesData.recursion = 6;
          saveAppData();
          loadIndex(browserWindow);
        },
        label: '6 Folders Deep',
        type: 'checkbox',
        checked: global.preferencesData.recursion == 6,
      },
      {
        click: () => { 
          global.preferencesData.recursion = 7;
          saveAppData();
          loadIndex(browserWindow);
        },
        label: '7 Folders Deep',
        type: 'checkbox',
        checked: global.preferencesData.recursion == 7,
      },
      {
        click: () => { 
          global.preferencesData.recursion = 8;
          saveAppData();
          loadIndex(browserWindow);
        },
        label: '8 Folders Deep',
        type: 'checkbox',
        checked: global.preferencesData.recursion == 8,
      },
    ]
  },
  {
    label: `Set Allowed Files`,
    type: 'submenu',
    submenu: [
      {
        click: () => { 
          global.preferencesData.DisableImages = !global.preferencesData.DisableImages;
          saveAppData();
          loadIndex(browserWindow);
        },
        label: 'Allow Images',
        type: 'checkbox',
        checked: !global.preferencesData.DisableImages,
      },
      {
        click: () => { 
          global.preferencesData.DisableVideos = !global.preferencesData.DisableVideos;
          saveAppData();
          loadIndex(browserWindow);
        },
        label: 'Allow Videos',
        type: 'checkbox',
        checked: !global.preferencesData.DisableVideos,
      },
    ]
  },
  {
    label: `Load Speed`,
    type: 'submenu',

    submenu: [
      {
        click: () => {
          global.preferencesData.loadSpeed = 'fastest';
          global.preferencesData.loadDelay = 0;
          saveAppData();
          browserWindow.webContents.send('preference-update');
        },
        label: "Fastest",
        type: "checkbox",
        checked: global.preferencesData.loadSpeed == 'fastest',
      },
      {
        click: () => {
          global.preferencesData.loadSpeed = 'fast';
          saveAppData();
          browserWindow.webContents.send('preference-update');
        },
        label: "Fast",
        type: "checkbox",
        checked: global.preferencesData.loadSpeed == 'fast',
      },
      {
        click: () => {
          global.preferencesData.loadSpeed = 'medium';
          saveAppData();
          browserWindow.webContents.send('preference-update');
        },
        label: "Medium",
        type: "checkbox",
        checked: global.preferencesData.loadSpeed == 'medium',
      },
      {
        click: () => {
          global.preferencesData.loadSpeed = 'slow';
          saveAppData();
          browserWindow.webContents.send('preference-update');
        },
        label: "Slow",
        type: "checkbox",
        checked: global.preferencesData.loadSpeed == 'slow',
      },
    ]
  },
  {
    label: `Choose Folder...`,
    // Only show it when right-clicking text
    type: 'checkbox',
    click: () => {
      const options = {
        title: 'Select a Folder',
        properties: ['openDirectory'],
        defaultPath: global.preferencesData.folderLocation, // Format must be... `C:\\Grimm Tales\\`
      };
      dialog.showOpenDialog(browserWindow, options)
        .then(result => {
          if (!result.canceled && result.filePaths.length > 0) {
            // Perform actions with the selected folder path
            loadFolder(browserWindow, result.filePaths[0]);
          }
        })
        .catch(err => {
          console.error('Error opening folder dialog:', err);
        });

    }
  },
  {
    label: `Copy Image Path`,
    visible: hasImage,
    type: 'checkbox',
    click: () => {
      // Action to copy the image path to clipboard
      const imagePath = parameters.srcURL.replace("file:///", "").replace(/%20/g, ' '); // Get the image source URL
      clipboard.writeText(imagePath); // Copy the image path to clipboard
      browserWindow.webContents.send('flash-copied', imagePath); 
    }
  },
  {
    label: `Delete Image`,
    visible: hasImage,
    type: 'checkbox',
    click: () => {
      // Action to copy the image path to clipboard
      const imagePath = parameters.srcURL.replace("file:///", "").replace(/%20/g, ' '); // Get the image source URL
      
      // Check if the file exists before attempting to delete it
      fs.access(imagePath, fs.constants.F_OK, (err) => {
        if (!err) {
          // File exists, proceed with deletion
          trash([imagePath]);
          browserWindow.webContents.send('deleted-file', imagePath); 
          console.log(`Deleted ${imagePath}`);
        } else {
          console.error('File does not exist or cannot be accessed');
        }
      });
    }
  },
  /*{
    label: `Search Google for ${parameters.srcURL.replace("file:///", "")}`,
    // Only show it when right-clicking text
    visible: parameters.hasImageContents,
    click: () => {
      url = parameters.srcURL;
      shell.openExternal(`https://lens.google.com/uploadbyurl?url=${encodeURIComponent(url)}`);
    }
  }*/
]
},
showSelectAll: false,
showSaveImageAs: false,
showInspectElement: false,
});