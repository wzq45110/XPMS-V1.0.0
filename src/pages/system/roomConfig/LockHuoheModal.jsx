import {
  Modal,
  Row,
  Col,
  Input,
  Form,
  Select,
  message,
  Divider,
  DatePicker,
  InputNumber,
} from 'antd';
import { useEffect, useState } from 'react';
import moment from 'moment';
import Constants from '@/constans';
import { getHuoheLockDetailByRoom, addHuoheLock, updateHuoheLock } from '@/services/doorlock';

const { Option } = Select;

const LockHuoheModal = props => {
  const [id, setId] = useState(null);

  useEffect(() => {
    if (props.visible) {
      if (props.record && props.record.lock_id) {
        getHuoheLockDetailByRoom(props.record.lock_id).then(rsp => {
          if (rsp && rsp.code == Constants.SUCCESS) {
            const data = rsp.data || [];
            if (data.length > 0) {
              const {
                hotel_group_id,
                hotel_id,
                id,
                room_no_id,
                valid,
                create_user,
                create_time,
                modify_user,
                modify_time,
                ...formValue
              } = data[0];
              formValue.room_no = props.record.room_no;
              formValue.power_update_time =
                formValue.power_update_time && moment(formValue.power_update_time);
              formValue.comu_status_update_time =
                formValue.comu_status_update_time && moment(formValue.comu_status_update_time);
              formValue.install_time = formValue.install_time && moment(formValue.install_time);
              formValue.guarantee_time_start =
                formValue.guarantee_time_start && moment(formValue.guarantee_time_start);
              formValue.guarantee_time_end =
                formValue.guarantee_time_end && moment(formValue.guarantee_time_end);
              setId(id);
              props.form.setFieldsValue(formValue);
            }
          }
        });
      }
    } else {
      props.form.resetFields();
      setId(null);
    }
  }, [props.visible]);

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

  const {
    form: { getFieldDecorator },
  } = props;

  const handleSubmit = () => {
    props.form.validateFields((err, fieldsValue) => {
      if (err == null) {
        console.log(fieldsValue);
        fieldsValue.power_update_time =
          fieldsValue.power_update_time &&
          fieldsValue.power_update_time.format('YYYY-MM-DD HH:mm:ss');
        fieldsValue.comu_status_update_time =
          fieldsValue.comu_status_update_time &&
          fieldsValue.comu_status_update_time.format('YYYY-MM-DD HH:mm:ss');
        fieldsValue.install_time =
          fieldsValue.install_time && fieldsValue.install_time.format('YYYY-MM-DD HH:mm:ss');
        fieldsValue.guarantee_time_start =
          fieldsValue.guarantee_time_start &&
          fieldsValue.guarantee_time_start.format('YYYY-MM-DD HH:mm:ss');
        fieldsValue.guarantee_time_end =
          fieldsValue.guarantee_time_end &&
          fieldsValue.guarantee_time_end.format('YYYY-MM-DD HH:mm:ss');
        if (!props.record.lock_id) {
          setLoading(true);
          addHuoheLock({ ...fieldsValue, room_no_id: props.record.id }).then(rsp => {
            setLoading(false);
            if (rsp && rsp.code == Constants.SUCCESS) {
              message.success(rsp.message || '????????????');
              props.handleCancel(true);
            }
          });
        } else {
          const { room_no, ...data } = fieldsValue;
          setLoading(true);
          updateHuoheLock({ ...data, id }).then(rsp => {
            setLoading(false);
            if (rsp && rsp.code == Constants.SUCCESS) {
              message.success(rsp.message || '????????????');
              props.handleCancel(true);
            }
          });
        }
      }
    });
  };

  const [loading, setLoading] = useState(false);

  return (
    <Modal
      title="????????????"
      visible={props.visible}
      width={720}
      onCancel={() => props.handleCancel()}
      onOk={handleSubmit}
      confirmLoading={loading}
    >
      <Form {...formItemLayout}>
        <Row gutter={8} type="flex">
          <Col span={12}>
            <Form.Item label="??????">
              {getFieldDecorator('room_no', { initialValue: props.record && props.record.room_no })(
                <Input disabled />,
              )}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="????????????">
              {getFieldDecorator(
                'lock_kind',
                {},
              )(
                <Select>
                  <Option key="0" value="0">
                    ????????????433??????
                  </Option>
                  <Option key="1" value="1">
                    ????????????
                  </Option>
                  <Option key="3" value="3">
                    ????????????433??????
                  </Option>
                  <Option key="5" value="5">
                    NB??????
                  </Option>
                </Select>,
              )}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="????????????">
              {getFieldDecorator(
                'type',
                {},
              )(
                <Select>
                  <Option key="1" value="1">
                    ??????????????? A221
                  </Option>
                  <Option key="2" value="2">
                    433 ???????????????????????? 120T
                  </Option>
                  <Option key="3" value="3">
                    ??????????????? A121
                  </Option>
                  <Option key="4" value="4">
                    433 ???????????????????????? A220T
                  </Option>
                  <Option key="5" value="5">
                    433 ??????????????? A120QT
                  </Option>
                  <Option key="32" value="32">
                    433 ??????????????? A130
                  </Option>
                  <Option key="48" value="48">
                    433 ??????????????? A230
                  </Option>
                  <Option key="49" value="49">
                    433 ??????????????????????????? ??? A230ID
                  </Option>
                  <Option key="50" value="50">
                    NB ?????? A232
                  </Option>
                  <Option key="" value="">
                    433 ???????????? A120 ??? A220
                  </Option>
                </Select>,
              )}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="????????????">
              {getFieldDecorator('software_version', {})(<Input />)}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="??????????????????">
              {getFieldDecorator('new_software_version', {})(<Input />)}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="????????????">
              {getFieldDecorator('hardware_version', {})(<Input />)}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="????????????">{getFieldDecorator('lock_no', {})(<Input />)}</Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="????????????">{getFieldDecorator('node_no', {})(<Input />)}</Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="????????????(0-100)">
              {getFieldDecorator('power', {})(<Input />)}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="??????????????????">
              {getFieldDecorator(
                'power_update_time',
                {},
              )(<DatePicker showTime style={{ width: '100%' }} format="YYYY-MM-DD HH:mm:ss" />)}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="??????????????????">
              {getFieldDecorator(
                'node_comu_status',
                {},
              )(
                <Select>
                  <Option key="00" value="00">
                    ????????????
                  </Option>
                  <Option key="01" value="01">
                    ????????????
                  </Option>
                </Select>,
              )}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="??????????????????">
              {getFieldDecorator(
                'comu_status',
                {},
              )(
                <Select>
                  <Option key="00" value="00">
                    ????????????
                  </Option>
                  <Option key="01" value="01">
                    ????????????
                  </Option>
                </Select>,
              )}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="??????????????????">
              {getFieldDecorator(
                'comu_status_update_time',
                {},
              )(<DatePicker showTime style={{ width: '100%' }} format="YYYY-MM-DD HH:mm:ss" />)}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="???????????????">
              {getFieldDecorator('rssi', {})(<InputNumber style={{ width: '100%' }} />)}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="????????????">{getFieldDecorator('region', {})(<Input />)}</Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="????????????">{getFieldDecorator('address', {})(<Input />)}</Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="????????????">{getFieldDecorator('house_code', {})(<Input />)}</Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="????????????">{getFieldDecorator('room_code', {})(<Input />)}</Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="??????????????????">
              {getFieldDecorator(
                'magnet_flag',
                {},
              )(
                <Select>
                  <Option key={0} value={0}>
                    ?????????
                  </Option>
                  <Option key={1} value={1}>
                    ??????
                  </Option>
                </Select>,
              )}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="?????????">
              {getFieldDecorator(
                'open_door_status',
                {},
              )(
                <Select>
                  <Option key="0" value="0">
                    ??????
                  </Option>
                  <Option key="1" value="1">
                    ??????
                  </Option>
                </Select>,
              )}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="????????????">
              {getFieldDecorator(
                'install_time',
                {},
              )(<DatePicker showTime style={{ width: '100%' }} format="YYYY-MM-DD HH:mm:ss" />)}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="?????????????????????">
              {getFieldDecorator(
                'guarantee_time_start',
                {},
              )(<DatePicker showTime style={{ width: '100%' }} format="YYYY-MM-DD HH:mm:ss" />)}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="?????????????????????">
              {getFieldDecorator(
                'guarantee_time_end',
                {},
              )(<DatePicker showTime style={{ width: '100%' }} format="YYYY-MM-DD HH:mm:ss" />)}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="??????">{getFieldDecorator('description', {})(<Input />)}</Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="SIM?????????">{getFieldDecorator('imsi', {})(<Input />)}</Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="??????">{getFieldDecorator('imei', {})(<Input />)}</Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="????????????">
              {getFieldDecorator('nb_revision', {})(<Input />)}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="????????????">{getFieldDecorator('work_mode', {})(<Input />)}</Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="????????????">{getFieldDecorator('psm_start', {})(<Input />)}</Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="????????????">{getFieldDecorator('psm_end', {})(<Input />)}</Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="??????????????????">
              {getFieldDecorator('psw_consult', {})(<Input />)}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="??????????????????">
              {getFieldDecorator(
                'fuc_flag',
                {},
              )(
                <Select>
                  <Option key={0} value={0}>
                    ??????
                  </Option>
                  <Option key={1} value={1}>
                    ??????
                  </Option>
                </Select>,
              )}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="????????????">
              {getFieldDecorator(
                'bluetooth_flag',
                {},
              )(
                <Select>
                  <Option key={0} value={0}>
                    ??????
                  </Option>
                  <Option key={1} value={1}>
                    ?????????
                  </Option>
                </Select>,
              )}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="????????????">
              {getFieldDecorator(
                'card_flag',
                {},
              )(
                <Select>
                  <Option key={0} value={0}>
                    ??????
                  </Option>
                  <Option key={1} value={1}>
                    ?????????
                  </Option>
                </Select>,
              )}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="??????">{getFieldDecorator('memo', {})(<Input />)}</Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default Form.create()(LockHuoheModal);
