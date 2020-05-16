const MIN_BLOCK_SIZE = 5;
const MIN_BLOCK_COUNT = 10;
const MAX_BLOCK_COUNT = 40000;
const MIN_DIVIDE_RANGE = 2;

const deskElement = document.getElementById('desk');
const blockColorPicker = document.getElementById('blockColor');
const gridColorPicker = document.getElementById('gridColor');
const blockCountInput = document.getElementById('blockCount');
const realBlockCountInput = document.getElementById('realBlockCount');

let mainBlock;
let lastBlockColor = blockColorPicker.value;

const getDeskSize = () => ({ width: deskElement.clientWidth, height: deskElement.clientHeight });

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
    this.htmlElement.addEventListener('click', handleClick);
    this.setElementPosition(left, top);
    return this.htmlElement;
  }
  setElementPosition(left, top) {
    this.htmlElement.style.top = `${top}px`;
    this.htmlElement.style.left = `${left}px`;
    this.htmlElement.style.height = `${this.height}px`;
    this.htmlElement.style.width = `${this.width}px`;
  }
}

function generateMap() {
  deskElement.innerHTML = '';
  mainBlock = new Block(getDeskSize(), '1');
  const usersBlockCount = isNaN(parseInt(blockCountInput.value)) ? MAX_BLOCK_COUNT : parseInt(blockCountInput.value);
  const maxBlockCount = Math.min(MAX_BLOCK_COUNT, Math.max(MIN_BLOCK_COUNT, usersBlockCount)) - MIN_BLOCK_COUNT;
  let blockCount = Math.floor(Math.random() * maxBlockCount) + MIN_BLOCK_COUNT;
  let realBlockCount = blockCount;
  let headBlock = mainBlock;
  let tailBlock = mainBlock;
  function saveToTail(block) {
    if (block.isSeparable()) {
      tailBlock.nextBlock = block;
      tailBlock = block;
    };
  }
  while (--blockCount && headBlock) {
    headBlock.splitBlock();
    saveToTail(headBlock.leftBlock);
    saveToTail(headBlock.rightBlock);
    ;
    headBlock = headBlock.nextBlock;
  }
  realBlockCountInput.value = realBlockCount - blockCount;
  mainBlock.render(0, 0);
  repaintGrid();
}

function handleClick() {
}

function changeBlockColor() {
}

function paintBlock(blockElement) {
}

function repaintGrid() {
}

generateMap();
