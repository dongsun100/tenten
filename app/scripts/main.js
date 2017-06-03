var TEN = 10;
var scoreWeight = [10, 30, 60, 100, 1000, 1000];

var blockTypes = [
  [
    [1]
  ],
  [
    [1, 1]
  ],
  [
    [1],
    [1]
  ],
  [
    ['X', 1],
    [1, 1]
  ],
  [
    [1, 'X'],
    [1, 1]
  ],
  [
    [1, 1],
    [1, 'X']
  ],
  [
    [1, 1],
    ['X', 1]
  ],
  [
    [1, 1],
    [1, 1]
  ],
  [
    [1, 1, 1]
  ],
  [
    [1],
    [1],
    [1]
  ],
  [
    [1, 1, 1],
    ['X', 'X', 1],
    ['X', 'X', 1],
  ],
  [
    [1, 1, 1],
    [1, 'X', 'X'],
    [1, 'X', 'X'],
  ],
  [
    ['X', 'X', 1],
    ['X', 'X', 1],
    [1, 1, 1],
  ],
  [
    [1, 'X', 'X'],
    [1, 'X', 'X'],
    [1, 1, 1],
  ],
  [
    [1, 1, 1],
    [1, 1, 1],
    [1, 1, 1]
  ],
  [
    [1, 1, 1, 1]
  ],
  [
    [1],
    [1],
    [1],
    [1]
  ]
];

// 마지막에 bg를 추가
var playground = [];
blockTypes.push(playground);

var PLAYGROUND_TYPE_INDEX = blockTypes.length - 1;
var PLAYGROUND_COLOR_INDEX = 6;
var score;

function clearPlayground() {
  var i, j;
  for(i=0;i<TEN;i++) {
    playground[i] = [];
    for(j=0;j<TEN;j++) {
      playground[i][j] = PLAYGROUND_COLOR_INDEX;
    }
  }

  score = 0;
  $('.score span').text(score);
}

var Block = function(color, type) {
  this.color = color;
  this.type = type;
  this.layout = blockTypes[this.type];
  this.height = this.layout.length;
  this.width = this.layout[0].length;
};

Block.prototype.makeHtmlString = function() {
  var blockLayout = this.layout;
  var i,j,strHtml = '';

  for(i=0;i<blockLayout.length;i++) {
    strHtml += '<div class="horz">';
    for(j=0;j<blockLayout[i].length;j++) {
      if(blockLayout[i][j] != 'X') {
        strHtml += '<div class="block color-' + this.color + '"></div>';
      }
      else {
        strHtml += '<div class="block color-x"></div>';
      }
    }
    strHtml += '</div>';
  }

  return strHtml;
}

var backgroundBlock;

function drawBackground() {
  clearPlayground();
  backgroundBlock = new Block(PLAYGROUND_COLOR_INDEX, PLAYGROUND_TYPE_INDEX);
  $('.bg').html(backgroundBlock.makeHtmlString());
}

function isValid(blockX, blockY, block) {
  var i,j;
  for(i=0;i<block.width;i++) {
    for(j=0;j<block.height;j++) {
      if(block.layout[j][i] != 'X') {
        if((blockY + j) >= TEN || (blockX + i) >= TEN) {
          continue;
        }
        if(playground[blockY + j][blockX + i] != PLAYGROUND_COLOR_INDEX) {
          return false;
        }
      }
    }
  }
  return true;
}

function makeRemainBlock() {
  $('.footer').html('<div class="remain-block remain-block0"></div><div class="remain-block remain-block1"></div><div class="remain-block remain-block2"></div>')
  
  for(var i=0;i<3;i++) {
    var remainBlock = new Block(parseInt(Math.random() * PLAYGROUND_COLOR_INDEX, 10), parseInt(Math.random() * PLAYGROUND_TYPE_INDEX, 10));
    $('.remain-block' + i)
      .html(remainBlock.makeHtmlString())
      .data('block', remainBlock);
  }

  var cursorAt;
  if(isMobile()) {
    cursorAt = {
      top: 130,
      left: 50
    };
  }
  $('.remain-block').draggable({
    cursor: 'move',
    cursorAt: cursorAt,
    drag: function() {
      var bgPosition = $('.bg').offset();
      var bgWidth = $('.bg').width();
      var myPosition = $(this).find('.horz:eq(0)').offset();
      var block = $(this).data('block');
      block.valid = undefined;
      
      //console.log('bgPosition (' + bgPosition.left + ', ' + bgPosition.top + ')');
      //console.log('myPosition (' + myPosition.left + ', ' + myPosition.top + ')');

      var blockLayout = block.layout;
      var blockColor = block.color;
      var blockHeight = block.height;
      var blockWidth = block.width;

      var cellWidth = (bgWidth / TEN);
      var cellHalfWidth = cellWidth / 2;

      var blockX = parseInt((cellHalfWidth + myPosition.left - bgPosition.left) / cellWidth, 10);
      var blockY = parseInt((cellHalfWidth + myPosition.top - bgPosition.top) / cellWidth, 10);

      // 블럭이 윤곽 바깥으로 나가는 지 체크(X)
      if((myPosition.left - bgPosition.left) < -cellHalfWidth || (blockX + blockWidth) > TEN) {
        return;
      }
      // 블럭이 윤곽 바깥으로 나가는 지 체크(Y)
      if((myPosition.top - bgPosition.top) < -cellHalfWidth || (blockY + blockHeight) > TEN) {
        return;
      }

      console.log('block (' + blockX + ', ' + blockY + ')');

      // 자리에 놓을 수 있는 지 체크
      if(isValid(blockX, blockY, block)) {
        block.x = blockX;
        block.y = blockY;
        block.valid = true;
        return true;
      }
    },
    revert: function(droppable) {
      if(!droppable) return true;
      
      var dropped = droppable.data('dropped');
      droppable.removeData('dropped')
      return !dropped;
    }
  });
}

function resetDivColor(x, y, color, delay) {
  delay = (delay !== undefined) ? delay : 300;
  setTimeout(function() {
    var $block = $('.bg .horz').eq(y).children('.block').eq(x);
    $block.attr('class', 'block color-' + color);
  }, delay);
}

function removeLines() {
  var x,y,i,j,yCheck,xCheck;
  var removedLineCount = 0;
  for(i=0;i<TEN;i++) {
    xCheck = yCheck = true;
    for(j=0;j<TEN;j++) {
      if(xCheck && playground[i][j] == PLAYGROUND_COLOR_INDEX) {
        xCheck = false;
      }
      if(yCheck && playground[j][i] == PLAYGROUND_COLOR_INDEX) {
        yCheck = false;
      }
    }
    if(xCheck) {
      for(x=0;x<TEN;x++) {
        playground[i][x] = PLAYGROUND_COLOR_INDEX;
        resetDivColor(x, i, PLAYGROUND_COLOR_INDEX);
      }
      removedLineCount++;
    }
    if(yCheck) {
      for(y=0;y<TEN;y++) {
        playground[y][i] = PLAYGROUND_COLOR_INDEX;
        resetDivColor(i, y, PLAYGROUND_COLOR_INDEX);
      }
      removedLineCount++;
    }
  }

  if(removedLineCount > 0) {
    score += scoreWeight[removedLineCount - 1];
  }
}

function checkGameover() {
  var $remainBlock = getHiddenRemainBlock();
  var invalidCount = 0;

  $remainBlock.each(function() {
    var x,y;
    var block = $(this).data('block');
    for(x=0;x<TEN-block.width;x++) {
      for(y=0;y<TEN-block.height;y++) {
        if(isValid(x, y, block)) {
          return;
        }
      }
    }
    invalidCount++;
  });

  if($remainBlock.length == invalidCount) {
    setTimeout(function() {
      $('.game-over').addClass('game-over-on');
      $('.footer').empty();
    }, 500);
  }
}

function getHiddenRemainBlock() {
  return $('.remain-block').filter(function() {
    return $(this).css('visibility') != 'hidden';
  });
}

function print() {
  console.table(playground);
}

$(function() {
  drawBackground();

  $('.bg').droppable({
    tolerance: isMobile() ? 'touch' : 'pointer',
    accept: '.remain-block',
    classes: {
      'ui-droppable-active':'ui-stat-active',
      'ui-droppable-hover': 'ui-stat-hover'
    },
    drop: function(e, ui) {
      var i,j;
      if(!ui.draggable || ui.draggable.length == 0) {
        return;
      }

      var block = ui.draggable.data('block');
      if(block.valid) {
        // 블럭에 해당하는 배경을 블럭색상으로 변경
        for(i=0;i<block.width;i++) {
          for(j=0;j<block.height;j++) {
            if(block.layout[j][i] == 1) {
              playground[block.y + j][block.x + i] = block.color;
              resetDivColor(block.x + i, block.y + j, block.color, 0);
              score++;
            }
          }
        }

        ui.draggable.css('visibility', 'hidden');
        removeLines();

        if(getHiddenRemainBlock().length == 0) {
          makeRemainBlock();
        }
        block.valid = undefined;

        ui.draggable.addClass('dropped');
        $(this).data('dropped', true);

        $('.score span').text(score);

        checkGameover();
      }

      return true;
    }
  });
  
  makeRemainBlock();

  $('.game-over button').on('click', function(e) {
    drawBackground();
    makeRemainBlock();
    $('.game-over').removeClass('game-over-on');
  });
});


$(document).on('touchmove', function(e) {
  e.preventDefault();
});

function isMobile() {
  return 'ontouchstart' in document;
}