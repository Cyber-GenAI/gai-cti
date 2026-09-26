export interface IPaginationProps {
  pageCount: number;
  handleMoveNext: () => void;
  handleMovePrev: () => void;
  length: number;
}
