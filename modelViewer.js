const TRAY = document.getElementById('js-tray-slide');
const modelViewerColor = document.querySelector("model-viewer#helmet");

document.querySelector('#color-controls').addEventListener('click', (event) => {
  const colorString = event.target.dataset.color;
  const material = modelViewerColor.model.materials;
  console.log(material)
  console.log(modelViewerColor.model)
  material[2].pbrMetallicRoughness.setBaseColorFactor(colorString);
});

const colors = [
  {
    texture: 'img/wood_.jpg',
    size: [2, 2, 2],
    shininess: 60
  },

  {
    texture: 'img/fabric_.jpg',
    size: [4, 4, 4],
    shininess: 0
  },
  {
    texture: 'img/fendi_casa_conrad_bump1.jpg',
    size: [4, 4, 4],
    shininess: 0
  },
  {
    texture: 'img/fendi_casa_conrad_difuse1.jpg',
    size: [4, 4, 4],
    shininess: 0
  },
  {
    texture: 'img/fendi_casa_conrad_difuse2.jpg',
    size: [4, 4, 4],
    shininess: 0
  },
  {
    texture: 'img/fendi_casa_conrad_difuse3.jpg',
    size: [4, 4, 4],
    shininess: 0
  },
  {
    texture: 'img/fendi_casa_conrad_difuse4.jpg',
    size: [4, 4, 4],
    shininess: 0
  },
  {
    texture: 'img/fendi_casa_conrad_difuse5.jpg',
    size: [4, 4, 4],
    shininess: 0
  },
  {
    texture: 'img/fendi_casa_conrad_difuse6.jpg',
    size: [4, 4, 4],
    shininess: 0
  },
  {
    texture: 'img/fendi_casa_conrad_reflect1.png',
    size: [4, 4, 4],
    shininess: 0
  },

  {
    texture: 'img/pattern_.jpg',
    size: [8, 8, 8],
    shininess: 10
  },

  {
    texture: 'img/denim_.jpg',
    size: [3, 3, 3],
    shininess: 0
  },

  {
    texture: 'img/quilt_.jpg',
    size: [6, 6, 6],
    shininess: 0
  },

];



const modelViewerTexture1 = document.querySelector("model-viewer#helmet");
// modelViewerTexture1.style.height = (screen.availHeight - 160).toString() +"px"

modelViewerTexture1.addEventListener("load", () => {


  const material = modelViewerTexture1.model.materials[0];
  console.log(modelViewerTexture1.model)

  const createAndApplyTexture = async (channel, color) => {
    const texture = await modelViewerTexture1.createTexture(color.texture);
    if (channel.includes('base') || channel.includes('metallic')) {
      material.pbrMetallicRoughness[channel].setTexture(texture);
    } else {
      material[channel].setTexture(texture);
    }
  }

  for (const swatch of swatches) {
    swatch.addEventListener('click', selectSwatch);
  }

  function selectSwatch(e) {
    console.log("dgdgdsfgdfsgdsgdsr", e.target.dataset.key)
    let color = colors[parseInt(e.target.dataset.key)];
    console.log(color)
    createAndApplyTexture('baseColorTexture', color);

  }

  // document.querySelector('#normals').addEventListener('input', (event) => {
    // createAndApplyTexture('normalTexture', event);
  // });

  // document.querySelector('#occlusion').addEventListener('input', (event) => {
  //   createAndApplyTexture('occlusionTexture', event);
  // });

  // document.querySelector('#emission').addEventListener('input', (event) => {
  //   createAndApplyTexture('emissiveTexture', event);
  // });

  // document.querySelector('#diffuse').addEventListener('input', (event) => {
  //   createAndApplyTexture('baseColorTexture', event);
  // });

  // document.querySelector('#metallicRoughness').addEventListener('input', (event) => {
  //   createAndApplyTexture('metallicRoughnessTexture', event);
  // });
});


function buildColors(colors) {
  console.log("dfgsdfgh")
  for (let [i, color] of colors.entries()) {
    let swatch = document.createElement('div');
    swatch.classList.add('tray__swatch');

    if (color.texture) {
      swatch.style.backgroundImage = "url(" + color.texture + ")";
    } else {
      swatch.style.background = "#" + color.color;
    }

    swatch.setAttribute('data-key', i);
    TRAY.append(swatch);
  }
}

buildColors(colors);

const swatches = document.querySelectorAll(".tray__swatch");

for (const swatch of swatches) {
  swatch.addEventListener('click', selectSwatch);
}

function selectSwatch(e) {
  let color = colors[parseInt(e.target.dataset.key)];
  createAndApplyTexture('normalTexture', color);
}


var slider = document.getElementById('js-tray'), sliderItems = document.getElementById('js-tray-slide'), difference;

function slide(wrapper, items) {
  var posX1 = 0,
    posX2 = 0,
    posInitial,
    threshold = 20,
    posFinal,
    slides = items.getElementsByClassName('tray__swatch');

  // Mouse events
  items.onmousedown = dragStart;

  // Touch events
  items.addEventListener('touchstart', dragStart);
  items.addEventListener('touchend', dragEnd);
  items.addEventListener('touchmove', dragAction);


  function dragStart(e) {
    e = e || window.event;
    posInitial = items.offsetLeft;
    difference = sliderItems.offsetWidth - slider.offsetWidth;
    difference = difference * -1;

    if (e.type == 'touchstart') {
      posX1 = e.touches[0].clientX;
    } else {
      posX1 = e.clientX;
      document.onmouseup = dragEnd;
      document.onmousemove = dragAction;
    }
  }

  function dragAction(e) {
    e = e || window.event;

    if (e.type == 'touchmove') {
      posX2 = posX1 - e.touches[0].clientX;
      posX1 = e.touches[0].clientX;
    } else {
      posX2 = posX1 - e.clientX;
      posX1 = e.clientX;
    }

    if (items.offsetLeft - posX2 <= 0 && items.offsetLeft - posX2 >= difference) {
      items.style.left = items.offsetLeft - posX2 + "px";
    }
  }

  function dragEnd(e) {
    posFinal = items.offsetLeft;
    if (posFinal - posInitial < -threshold) {

    } else if (posFinal - posInitial > threshold) {

    } else {
      items.style.left = posInitial + "px";
    }

    document.onmouseup = null;
    document.onmousemove = null;
  }

}

slide(slider, sliderItems);