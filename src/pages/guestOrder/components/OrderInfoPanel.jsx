import styles from './style.less';
import {
  Radio,
  Row,
  Col,
  InputNumber,
  DatePicker,
  Select,
  Input,
  Button,
  Form,
  message,
} from 'antd';
import moment from 'moment';
import { useEffect } from 'react';
import { getOrderType, checkInSubmit, getRoomType } from '@/services/checkIn';
import { useState } from 'react';
import Constants from '@/constans';
import { PageLoading } from '@ant-design/pro-layout';
import { connect } from 'dva';
import Dict from '@/dictionary';

const { Option } = Select;

const OrderInfoPanel = props => {
  const [orderType, setOrderType] = useState([]);
  const [hourId, setHourId] = useState(null);
  const [roomTypes, setRoomTypes] = useState([]);
  // console.log(props)
  useEffect(() => {
    getOrderType().then(rsp => {
      if (rsp && rsp.code == Constants.SUCCESS) {
        if (rsp.data) {
          setOrderType(rsp.data || []);
          rsp.data.map(item => {
            if (item.dictcode == 'YD002') setHourId(item.id);
          });
        }
      }
    });

    getRoomType().then(rsp => {
      if (rsp && rsp.code == Constants.SUCCESS) {
        if (rsp.data) {
          setRoomTypes(rsp.data || []);
        }
      }
    });
  }, []);

  const {
    form: { getFieldDecorator },
  } = props;

  const formItemLayout = {
    labelCol: {
      xs: { span: 12 },
      sm: { span: 8 },
    },
    wrapperCol: {
      xs: { span: 12 },
      sm: { span: 16 },
    },
  };

  const handleSubmit = e => {
    e.preventDefault();
    props.form.validateFields((err, values) => {
      if (!err) {
        let days_num = 0;
        let hours_num = 0;
        if (values.order_type_id == hourId) {
          hours_num = values.days_num;
        } else {
          days_num = values.days_num;
        }

        const order = {
          order_info: {
            id: props.id,
            order_type_id: values.order_type_id,
          },
          rooms: {
            id: props.order_info_room_id,
            days_num,
            hours_num,
            checkin_time: values.checkin_time.format('YYYY-MM-DD HH:mm:ss'),
            checkout_time: values.checkout_time.format('YYYY-MM-DD HH:mm:ss'),
            room_type_id: values.room_type_id,
            // room_no_id
          },
        };
        // console.log(order);
        const { dispatch } = props;
        if (dispatch) {
          dispatch({
            type: 'global/changeLoading',
            payload: true,
          });
          checkInSubmit(order).then(rsp => {
            dispatch({
              type: 'global/changeLoading',
              payload: false,
            });
            if (rsp && rsp.code == Constants.SUCCESS) {
              // console.log(rsp);
              message.info('????????????');
              // location.reload()
            }
          });
        }
      }
    });
  };

  const handleChangeCheckIn = date => {
    setStartValue(date);

    const {
      form: { getFieldValue, setFieldsValue },
    } = props;
    const orderType = getFieldValue('order_type_id');

    const leaveTime = getFieldValue('checkout_time');
    const tempLeave = moment(leaveTime);
    const tempArrive = moment(date);
    let count = 0;
    if (orderType == hourId) {
      //?????????
      count = tempLeave.startOf('hour').diff(tempArrive.startOf('hour'), 'hour');
    } else {
      count = tempLeave.startOf('day').diff(tempArrive.startOf('day'), 'day');
    }
    setFieldsValue({ checkout_time: leaveTime, days_num: count });
  };

  const handleChangeCheckOut = date => {
    console.log(date)
    setEndValue(date);

    const {
      form: { getFieldValue, setFieldsValue },
    } = props;
    const orderType = getFieldValue('order_type_id');

    const arriveTime = getFieldValue('checkin_time');
    const tempArrive = moment(arriveTime);
    const tempLeave = moment(date);
    let count = 0;
    if (orderType == hourId) {
      //?????????
      count = tempLeave.startOf('hour').diff(tempArrive.startOf('hour'), 'hour');
    } else {
      count = tempLeave.startOf('day').diff(tempArrive.startOf('day'), 'day');
    }
    console.log(arriveTime)
    setFieldsValue({ checkin_time: arriveTime, days_num: count });
  };

  const handleChangeDays = value => {
    const {
      form: { getFieldValue, setFieldsValue },
    } = props;
    const orderType = getFieldValue('order_type_id');

    const arriveTime = getFieldValue('checkin_time');
    const tempArrive = moment(arriveTime);
    if (orderType == hourId) {
      const checkout_time = tempArrive.add(value, 'h');
      setFieldsValue({ checkin_time: arriveTime, checkout_time });
      setEndValue(checkout_time);
    } else {
      const checkout_time = tempArrive
        .add(value, 'd')
        .hour(14)
        .startOf('hour');
      setFieldsValue({
        checkin_time: arriveTime,
        checkout_time,
      });
      setEndValue(checkout_time);
    }
  };

  const [startValue, setStartValue] = useState(null);
  const [endValue, setEndValue] = useState(null);

  useEffect(() => {
    setStartValue(moment(props.checkin_time));
    setEndValue(moment(props.checkout_time));
  }, [props.checkout_time, props.checkout_time]);

  const disabledStartDate = startDate => {
    if (!startDate || !endValue) {
      return false;
    }
    return startDate.valueOf() > endValue.valueOf();
  };

  const disabledEndDate = endDate => {
    if (!endDate || !startValue) {
      return false;
    }
    return endDate.valueOf() <= startValue.valueOf();
  };
  //?????????????????????  ?????????????????????????????? ?????????????????? ???????????????????????????   ?????????props??????????????? ?????????????????????????????????
  useEffect(() => {
    const {
      form: { setFieldsValue },
    } = props;
    setFieldsValue({ checkout_time: moment(props.checkout_time), days_num: props.days_num || props.hours_num })
  }, [props.checkout_time, props.days_num || props.hours_num])
  return (
    <Form {...formItemLayout} className={styles.panelForm} onSubmit={handleSubmit}>
      <Form.Item wrapperCol={{ offset: 4 }}>
        {getFieldDecorator('order_type_id', {
          rules: [
            {
              required: true,
              message: '???????????????',
            },
          ],
          initialValue: props.order_type_id,
        })(
          <Radio.Group disabled>
            {orderType.map(item => (
              <Radio key={item.id} value={item.id}>
                {item.description}
              </Radio>
            ))}
          </Radio.Group>
        )}
      </Form.Item>
      <Form.Item label={props.order_type_id == Dict.hourTypeId ? '????????????' : '????????????'}>
        {getFieldDecorator('days_num', {
          rules: [
            {
              required: true,
              message: '?????????????????????',
            },
          ],
          initialValue: props.days_num || props.hours_num,
        })(<InputNumber onChange={value => handleChangeDays(value)} min={0} />)}
      </Form.Item>
      <Form.Item label="????????????">
        {getFieldDecorator('checkin_time', { initialValue: moment(props.checkin_time) })(
          <DatePicker
            showTime
            format="YYYY-MM-DD HH:mm:ss"
            style={{ width: '100%', minWidth: 'inherit' }}
            disabledDate={date => disabledStartDate(date)}
            onChange={value => handleChangeCheckIn(value)}
            disabled={props.status != 'R' && props.status != 'RG'}
          />
        )}
      </Form.Item>
      <Form.Item label="????????????">
        {getFieldDecorator('checkout_time', { initialValue: moment(props.checkout_time) })(
          <DatePicker
            showTime
            format="YYYY-MM-DD HH:mm:ss"
            style={{ width: '100%', minWidth: 'inherit' }}
            disabledDate={date => disabledEndDate(date)}
            onChange={value => handleChangeCheckOut(value)}
          />,
        )}
      </Form.Item>
      <Form.Item label="??????">
        {getFieldDecorator('room_type_id', { initialValue: props.room_type_id })(
          <Select disabled={props.room_no ? true : true}>
            {roomTypes.map(item => (
              <Option key={item.id} value={item.id}>
                {item.name}
              </Option>
            ))}
          </Select>
        )}
      </Form.Item>
      {props.room_no && (
        <Form.Item label="??????">
          {getFieldDecorator('room_no', { initialValue: props.room_no })(<Input disabled />)}
        </Form.Item>
      )}
      {props.status && (props.status == 'I' || props.status == 'R' || props.status == 'RG') && (
        <Form.Item wrapperCol={{ offset: 16 }}>
          <Button type="primary" htmlType="submit" style={{ marginLeft: '10px' }}>
            ??????
          </Button>
        </Form.Item>
      )}
    </Form>
  );
};

export default connect(({ global }) => ({ loading: global.loading }))(
  Form.create()(OrderInfoPanel),
);
