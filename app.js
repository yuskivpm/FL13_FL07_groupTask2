const MIN_BLOCK_SIZE = 5;
const MIN_BLOCK_COUNT = 9;
const MAX_BLOCK_COUNT = 40000;
const MIN_DIVIDE_RANGE = 2;
const PALETTE_BLOCK_SIZE = 90;

const deskElement = document.getElementById('desk');
const blockColorPicker = document.getElementById('blockColor');
const gridColorPicker = document.getElementById('gridColor');
const blockCountInput = document.getElementById('blockCount');
const realBlockCountInput = document.getElementById('realBlockCount');
const additionalFeaturesBlock = document.getElementById('additionalFeaturesBlock');
const additionalFeatures = document.getElementById('additionalFeatures');
const paletteWholeBlock = document.getElementById('featurePalette');
const paletteHolder = document.getElementById('palette');
const randomizeBlockCountCheckbox = document.getElementById('randomizeBlockCount');
const settingsMenu = document.getElementById('featuresInputsInfo');
const generateMosaicBlock = document.getElementById('generateMosaicBlock');
const settingsMenuBurger = document.getElementById('burger');
const generatingMapButton = document.querySelector('.button');


let mainBlock;
let maxPaletteCount;

const getDeskSize = () => ({
  left: 0,
  top: 0,
  width: deskElement.clientWidth,
  height: deskElement.clientHeight
});

deskElement.addEventListener('click', handleClick);

class Block {
  constructor({ width, height }) {
    this.width = width;
    this.height = height;
  }

  isSeparable() {
    return this.width > MIN_BLOCK_SIZE || this.height > MIN_BLOCK_SIZE;
  }

  splitBlock() {
    this.verticalSplit = this.width > this.height;
    this.splitPosition = Math.random();
    const childBlock = { width: this.width, height: this.height };
    this.leftBlock = new Block(childBlock);
    this.rightBlock = new Block(childBlock);
    this.updateChildrenSize();
  }

  updateChildrenSize() {
    if (this.verticalSplit) {
      const realSplitPosition = this.divideSize(this.width);
      this.leftBlock.width = realSplitPosition;
      this.leftBlock.height = this.height;
      this.rightBlock.width = this.width - realSplitPosition;
      this.rightBlock.height = this.height;
    } else {
      const realSplitPosition = this.divideSize(this.height);
      this.leftBlock.height = realSplitPosition;
      this.leftBlock.width = this.width;
      this.rightBlock.height = this.height - realSplitPosition;
      this.rightBlock.width = this.width;
    }
  }

  divideSize(oldSize) {
    return Math.floor(this.splitPosition * (1 + oldSize >> 1)) + 1 + (oldSize >> MIN_DIVIDE_RANGE);
  }

  render(left, top) {
    if (this.leftBlock) {
      this.leftBlock.render(left, top);
      this.rightBlock.render(
        left + (this.verticalSplit ? this.leftBlock.width : 0),
        top + (this.verticalSplit ? 0 : this.leftBlock.height)
      );
    } else {
      deskElement.appendChild(this.createElement(left, top));
    }
  }

  createElement(left, top) {
    this.htmlElement = document.createElement('div');
    this.htmlElement.className = 'block';
    this.setElementPosition(left, top);
    return this.htmlElement;
  }

  setElementPosition(left, top) {
    this.htmlElement.style.top = `${top}px`;
    this.htmlElement.style.left = `${left}px`;
    this.htmlElement.style.height = `${this.height}px`;
    this.htmlElement.style.width = `${this.width}px`;
  }

  resizeDesk({ left, top, width = this.width, height = this.height }) {
    this.width = width;
    this.height = height;
    if (this.leftBlock) {
      this.updateChildrenSize();
      this.leftBlock.resizeDesk({ left, top });
      this.rightBlock.resizeDesk({
        left: left + (this.verticalSplit ? this.leftBlock.width : 0),
        top: top + (this.verticalSplit ? 0 : this.leftBlock.height)
      });
    } else {
      this.setElementPosition(left, top);
    }
  }
}

function generateMap() {
  deskElement.innerHTML = '';
  mainBlock = new Block(getDeskSize(), '1');
  const usersBlockCount = isNaN(parseInt(blockCountInput.value)) ? MAX_BLOCK_COUNT : parseInt(blockCountInput.value);
  let blockCount;
  if (randomizeBlockCountCheckbox.checked) {
    const maxBlockCount = Math.min(MAX_BLOCK_COUNT, Math.max(MIN_BLOCK_COUNT, usersBlockCount)) - MIN_BLOCK_COUNT;
    blockCount = Math.floor(Math.random() * maxBlockCount) + MIN_BLOCK_COUNT;
  } else {
    blockCount = Math.min(MAX_BLOCK_COUNT, Math.max(MIN_BLOCK_COUNT, usersBlockCount));
  }
  let realBlockCount = blockCount;
  let headBlock = mainBlock;
  let tailBlock = mainBlock;

  function saveToTail(block) {
    if (block.isSeparable()) {
      tailBlock.nextBlock = block;
      tailBlock = block;
    }
  }

  while (--blockCount && headBlock) {
    headBlock.splitBlock();
    saveToTail(headBlock.leftBlock);
    saveToTail(headBlock.rightBlock);
    headBlock = headBlock.nextBlock;
  }
  realBlockCountInput.value = realBlockCount - blockCount;
  mainBlock.render(0, 0);
  repaintGrid();
  reorderPalette();
}

function repaintGrid() {
  deskElement.querySelectorAll('.block').forEach(({ style }) => {
    style.borderColor = gridColorPicker.value
  });
}

function reorderPalette() {
  maxPaletteCount = Math.floor(paletteHolder.clientHeight / PALETTE_BLOCK_SIZE);
  while (paletteHolder.children.length > maxPaletteCount) {
    paletteHolder.children[0].remove();
  }
}

function handleClick({ shiftKey, ctrlKey, target: { id, classList: targetClassList } }) {
  if (id !== 'desk') {
    if (!shiftKey && !ctrlKey) {
      deskElement.querySelectorAll('.active').forEach(({ classList }) => classList.remove('active'));
    }
    targetClassList.add('active');
  }
}

function changeBlockColor() {
  const backgroundColor = blockColorPicker.value;
  paintActiveBlocks(backgroundColor);
  addToPalette(backgroundColor);
}

function paintActiveBlocks(backgroundColor) {
  document.querySelectorAll('.active').forEach(({ style }) => {
    style.backgroundColor = backgroundColor;
  });
}

function hexToRgb(hexColor) {
  const FF = 255;
  const F = 16;
  const RED = 8;
  const intColor = parseInt(hexColor.slice(1), F);
  const red = intColor >> F & FF;
  const green = intColor >> RED & FF;
  const blue = intColor & FF;
  return `rgb(${red}, ${green}, ${blue})`;
}

function addToPalette(color) {
  const rgbColor = hexToRgb(color);
  const existBottle = Array.prototype.find.call(
    paletteHolder.children,
    ({ style: { backgroundColor } }) => backgroundColor === rgbColor
  );
  if (existBottle) {
    paletteHolder.appendChild(existBottle);
  } else {
    const bottle = paletteHolder.appendChild(document.createElement('div'));
    bottle.className = 'palette-block';
    bottle.style.backgroundColor = color;
    bottle.addEventListener('click', handlePaletteClick);
    reorderPalette();
  }
}

function handlePaletteClick({ target: { style: { backgroundColor } } }) {
  paintActiveBlocks(backgroundColor);
}

function showSettings() {
  if (settingsMenu.style.display === 'block') {
    settingsMenu.style.display = 'none';
    paletteWholeBlock.style.margin = '0';
    additionalFeatures.style.justifyContent = 'flex-end';
  } else {
    settingsMenu.style.display = 'block';
    paletteWholeBlock.style.marginRight = '40px';
    additionalFeatures.style.justifyContent = 'space-between';
  }
}

window.addEventListener('resize', () => mainBlock.resizeDesk(getDeskSize()));

generateMap();

settingsMenuBurger.addEventListener('click', showSettings);
gridColorPicker.addEventListener('change', repaintGrid);
blockColorPicker.addEventListener('change', changeBlockColor);
generatingMapButton.addEventListener('click', generateMap);