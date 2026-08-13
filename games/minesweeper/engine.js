export function createBoard(rows, cols) {
  return Array.from({ length: rows }, (_, row) => Array.from({ length: cols }, (_, col) => ({ row, col, mine:false, revealed:false, flagged:false, adjacent:0 })));
}

export function neighbors(board,row,col){const cells=[];for(let r=Math.max(0,row-1);r<=Math.min(board.length-1,row+1);r+=1)for(let c=Math.max(0,col-1);c<=Math.min(board[0].length-1,col+1);c+=1)if(r!==row||c!==col)cells.push(board[r][c]);return cells;}

export function placeMines(board,count,safeRow,safeCol,random=Math.random){
  const excluded=new Set([board[safeRow][safeCol],...neighbors(board,safeRow,safeCol)]);
  const candidates=board.flat().filter(cell=>!excluded.has(cell));
  for(let i=candidates.length-1;i>0;i-=1){const j=Math.floor(random()*(i+1));[candidates[i],candidates[j]]=[candidates[j],candidates[i]];}
  candidates.slice(0,count).forEach(cell=>cell.mine=true);
  board.flat().forEach(cell=>cell.adjacent=neighbors(board,cell.row,cell.col).filter(n=>n.mine).length);
  return board;
}

export function toggleFlag(board,row,col){const cell=board[row]?.[col];if(!cell||cell.revealed)return false;cell.flagged=!cell.flagged;return true;}

export function reveal(board,row,col){
  const cell=board[row]?.[col];if(!cell||cell.flagged||cell.revealed)return {changed:false,hitMine:false};
  const queue=[cell];let changed=false;
  while(queue.length){const current=queue.shift();if(current.revealed||current.flagged)continue;current.revealed=true;changed=true;if(!current.mine&&current.adjacent===0)neighbors(board,current.row,current.col).filter(n=>!n.revealed&&!n.mine&&!n.flagged).forEach(n=>queue.push(n));}
  return {changed,hitMine:cell.mine};
}

export function isWon(board){return board.flat().every(cell=>cell.mine||cell.revealed);}
