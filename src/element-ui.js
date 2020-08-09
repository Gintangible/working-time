import Vue from "vue";

import {
  Row,
  Col,
  Table,
  TableColumn,
  Pagination,
  Button,
  Upload,
  Dialog,
  TimeSelect,
  TimePicker,
  MessageBox,
  Select,
  Option,
  Form,
  FormItem
} from "element-ui";

Vue.use(Pagination);
Vue.use(Dialog);
Vue.use(Button);
Vue.use(Row);
Vue.use(TableColumn);
Vue.use(Table);
Vue.use(Col);
Vue.use(TimeSelect);
Vue.use(TimePicker);
Vue.use(Select);
Vue.use(Option);
Vue.use(Form);
Vue.use(FormItem);
Vue.use(Upload);

Vue.prototype.$msgbox = MessageBox;
Vue.prototype.$confirm = MessageBox.confirm;
