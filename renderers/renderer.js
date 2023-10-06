// renderer.js
const ipcRend = window.ipcRenderer;

const imageGrid = document.getElementById('imageGrid');

let preferencesData;
function updatePreferencesData(callback) {
  /* Request our data */
  ipcRend.invoke('loadAppData').then(data => { preferencesData = data; callback(); });
}
updatePreferencesData(readFile);

currentZoom = 1;
currentPadding = .98;

let grid;
let resortAfterImageLoad;

function readFile() {
  ipcRend.invoke('readFile', preferencesData.folderLocation).then(files => {
    console.log(`${preferencesData.folderLocation}`);
  
    resortAfterImageLoad = false;
  
    grid = new Masonry('.grid', {
      itemSelector: '.grid-item',
      gutter: 0,
    });
  
    files = resort(files);
    handle_resort(files);
    loadImages(files);
  
    window.electronAPI.onSortUpdate((event, value) => {
      console.log('sort update');
      updatePreferencesData(() => { 
        files = resort(files);
        handle_resort(files);
        resortAfterImageLoad = true;
      });
    })
  
    // Lazy loads images. Does so with a bit of a delays
    async function loadImages(input_files) {
      const delay = 5; // Delay in milliseconds
      const cached_files = [...input_files];
  
      noItemsEl = document.getElementById(`no-items-text`);
      headerPathEl = document.getElementById(`header-folder-path`);
      headerPathEl.innerHTML = preferencesData.folderLocation;
      if (cached_files.length == 0)
      {
        noItemsEl.classList.add("show");
        pathEl = document.getElementById(`folder-path`);
        pathEl.innerHTML = preferencesData.folderLocation;
        return;
      }
      noItemsEl.classList.remove("show");
  
      for (const file of cached_files) {
        // Only generate a new element and append it if it doesn't already exist
        const existingEl = document.getElementById(`${file.name}`);
        if (existingEl != null) continue;
  
        // Create img element
        const imgPath = `${preferencesData.folderLocation}/${file.name}`;
        const imgElement = document.createElement('img');
        imgElement.src = imgPath;
        imgElement.id = `${file.name}`;
        imgElement.className = "grid-image";
  
        // Create div element
        const gridItem = document.createElement('div');
        gridItem.className = 'grid-item';
        gridItem.appendChild(imgElement);
  
        // Add to grid
        imageGrid.appendChild(gridItem);
        grid.appended(gridItem);
        grid.reloadItems();
        grid.layout();
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      // Show done pop up
      const popUp = document.getElementById(`done-pop-up`);
      popUp.classList.add('show');
  
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      for (const file of cached_files) {
        // Only generate a new element and append it if it doesn't already exist
        const existingEl = document.getElementById(`${file.name}`);
        if (existingEl != null) existingEl.classList.add("shown");
      }
  
      if (resortAfterImageLoad) handle_resort(files);
      resortAfterImageLoad = false;
    }
  
    // Listen for the wheel event to adjust the CSS property
    imageGrid.addEventListener('wheel', event => {
      if (event.ctrlKey) {
        event.preventDefault();
  
        // Determine the direction of the scroll
        const zoomAmount = event.deltaY > 0 ? 0.75 : 1.25;
        currentZoom *= zoomAmount;
        currentZoom = Math.max(currentZoom, 0.1);
        update_images();  
        // Trigger Masonry Layout's layout after changing the CSS property
        grid.layout();    
      }
      else if (event.shiftKey)
      {
        // Determine the direction of the scroll
        const paddingAmount = event.deltaY > 0 ? 0.1 : -0.1;
        currentPadding += paddingAmount;
        currentPadding = Math.max(Math.min(currentPadding, 1), 0.25);
        update_images();
        // Trigger Masonry Layout's layout after changing the CSS property
        grid.layout();
      }
    });
  
    setTimeout(() => { update_images(); grid.layout(); }, 100);
  
    window.addEventListener('resize', function(event) {
        update_images();
        // Trigger Masonry Layout's layout after changing the CSS property
        grid.layout();
    }, true);
  
  }).catch(err => {
    console.error('Error reading image folder:', err);
  });
}


function update_images() {
  const gridItems = document.querySelectorAll('.grid-image');
  // Get new width
  width = calc_width();
  gridItems.forEach(item => {
    item.style.maxWidth = `${width}px`;
    item.style.minWidth = `${width}px`;
    item.style.transform = `scale(${currentPadding})`;
    // You can adjust other styling properties as needed
  });
  imageGrid.style.transform = `scale(${get_transform_correction_scale()})`;
  imageGrid.style.marginTop = `${(1-currentPadding)*width}px`;
}

function calc_width() {
  originalWidth = (500 * currentZoom);
  return originalWidth;
}

function get_transform_correction_scale() {
  originalWidth = (500 * currentZoom);
  itemsCount = Math.floor((document.body.clientWidth / originalWidth));
  actualPresentedWidth = originalWidth * itemsCount;
  transformScale = (document.body.clientWidth / actualPresentedWidth);
  return transformScale;
}

function resort(files) {
  switch (preferencesData.sortMode) {
    case 'newest':
      console.log(`sorting by newest`);
      files = files.sort((a, b) => b.date - a.date); break;
    case 'oldest':
      console.log(`sorting by oldest`);
      files = files.sort((a, b) => b.date - a.date); 
      files = files.reverse(); break;
    case 'name-a':
      console.log(`sorting by name a to z`);
      files = files.sort((a, b) => a.name.localeCompare(b.name)); break;
    case 'name-z':
      console.log(`sorting by name z to a`);
      files = files.sort((a, b) => a.name.localeCompare(b.name));
      files = files.reverse(); break;
    case 'type-a':
      console.log(`sorting by type a to z`);
      files = files.sort(sortByExtension); break;
    case 'type-z':
      console.log(`sorting by type z to a`);
      files = files.sort(sortByExtension);
      files = files.reverse(); break;
    case 'random':
      console.log(`sorting randomly`);
      for (let i = files.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [files[i], files[j]] = [files[j], files[i]];
      }
      break;
  }
  return files;
}

// Custom sorting function to sort by file extension
function sortByExtension(a, b) {
  const extA = a.name.split('.').pop().toLowerCase(); // Get the extension of file A
  const extB = b.name.split('.').pop().toLowerCase(); // Get the extension of file B

  if (extA < extB) {
    return -1; // A should come before B
  }
  if (extA > extB) {
    return 1; // A should come after B
  }
  return 0; // A and B are of the same type
}

function handle_resort(cached_files) {
  cached_files.reverse().forEach(file => {
    const imgElement = document.getElementById(`${file.name}`);
    if (imgElement == null) return;
    const divElement = imgElement.parentElement;
    const parentElement = divElement.parentElement;
    parentElement.insertBefore(divElement, parentElement.firstChild);
  });
  cached_files.reverse();
  grid.reloadItems();
  grid.layout();
}


