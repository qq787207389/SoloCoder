import { registerColumnType } from '../../utils/columnTypes';
import { TextCell } from './TextCell';
import { NumberCell } from './NumberCell';
import { SelectCell } from './SelectCell';
import { MultiSelectCell } from './MultiSelectCell';
import { DateCell } from './DateCell';
import { LinkRecordCell } from './LinkRecordCell';
import { AttachmentCell } from './AttachmentCell';

export function registerAllColumnTypes() {
  registerColumnType({
    type: 'text',
    name: '文本',
    icon: 'type',
    CellRenderer: TextCell,
    defaultValue: null,
  });

  registerColumnType({
    type: 'number',
    name: '数字',
    icon: 'hash',
    CellRenderer: NumberCell,
    defaultValue: null,
  });

  registerColumnType({
    type: 'select',
    name: '单选',
    icon: 'list',
    CellRenderer: SelectCell,
    defaultValue: null,
  });

  registerColumnType({
    type: 'multiSelect',
    name: '多选',
    icon: 'check-square',
    CellRenderer: MultiSelectCell,
    defaultValue: [],
  });

  registerColumnType({
    type: 'date',
    name: '日期',
    icon: 'calendar',
    CellRenderer: DateCell,
    defaultValue: null,
  });

  registerColumnType({
    type: 'linkRecord',
    name: '关联记录',
    icon: 'link',
    CellRenderer: LinkRecordCell,
    defaultValue: null,
  });

  registerColumnType({
    type: 'attachment',
    name: '附件',
    icon: 'paperclip',
    CellRenderer: AttachmentCell,
    defaultValue: [],
  });
}
