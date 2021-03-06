import { Modal, Row, Col, Input, Form, message, InputNumber, Select, DatePicker } from 'antd';
import { useEffect, useState } from 'react';
import { saveRoomRate, updateRoomRate } from '@/services/system/codeConfig';
import Constants from '@/constans';
import Dict from '@/dictionary';
import { getMarket, getSource, getPackages } from '@/services/checkIn';
import moment from 'moment';
const { Option } = Select;

const RoomRateMoal = props => {
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

  useEffect(() => {
    if (props.visible) {
      if (props.formValues) {
        const {
          order_type_id,
          market_id,
          source_id,
          packages_id,
          list_order,
          room_rate_code,
          description,
          description_en,
          date_start,
          date_end,
          memo,
          is_private,
        } = props.formValues;
        props.form.setFieldsValue({
          order_type_id,
          market_id,
          source_id,
          packages_id,
          list_order,
          room_rate_code,
          description,
          description_en,
          date_start: moment(date_start),
          date_end: moment(date_end),
          memo,
          is_private,
        });
      } else {
        props.form.resetFields();
      }
    }
  }, [props.visible]);

  useEffect(() => {
    getMarket().then(rsp => {
      if (rsp && rsp.code == Constants.SUCCESS) {
        const data = rsp.data || [];
        setMarket(data);
      }
    });

    getSource().then(rsp => {
      if (rsp && rsp.code == Constants.SUCCESS) {
        const data = rsp.data || [];
        setSource(data);
      }
    });

    getPackages().then(rsp => {
      if (rsp && rsp.code == Constants.SUCCESS) {
        const data = rsp.data || [];
        setPackages(data);
      }
    });
  }, []);

  const handleSubmit = () => {
    props.form.validateFields((err, fieldsValue) => {
      if (err == null) {
        fieldsValue.date_start =
          fieldsValue.date_start && fieldsValue.date_start.format('YYYY-MM-DD HH:mm:ss');
        fieldsValue.date_end =
          fieldsValue.date_end && fieldsValue.date_end.format('YYYY-MM-DD HH:mm:ss');

        let currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
        const { hotel_group_id, hotel_id, id: create_user } = currentUser;
        const modify_user = create_user;
        if (props.isAdd) {
          setLoading(true);
          saveRoomRate([
            {
              ...fieldsValue,
              hotel_group_id,
              hotel_id,
              create_user,
              modify_user,
            },
          ]).then(rsp => {
            setLoading(false);
            if (rsp && rsp.code == Constants.SUCCESS) {
              message.success(rsp.message || '????????????');
              props.handleCancel(true);
            }
          });
        } else {
          setLoading(true);
          updateRoomRate([{ ...fieldsValue, id: props.formValues.id, modify_user }]).then(rsp => {
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
  const [market, setMarket] = useState([]);
  const [source, setSource] = useState([]);
  const [packages, setPackages] = useState([]);

  return (
    <Modal
      title="?????????"
      visible={props.visible}
      onCancel={() => props.handleCancel()}
      onOk={handleSubmit}
      confirmLoading={loading}
    >
      <Form {...formItemLayout}>
        <Row gutter={8}>
          <Col span={12}>
            <Form.Item label="????????????">
              {getFieldDecorator('order_type_id', {
                rules: [{ required: true, message: '????????????' }],
              })(
                <Select>
                  {Dict.orderType.map(item => (
                    <Option key={item.id} value={item.id}>
                      {item.name}
                    </Option>
                  ))}
                </Select>,
              )}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="??????">
              {getFieldDecorator('market_id', {
                rules: [{ required: true, message: '??????' }],
              })(
                <Select>
                  {market.map(item => (
                    <Option key={item.id} value={item.id}>
                      {item.description}
                    </Option>
                  ))}
                </Select>,
              )}
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={8}>
          <Col span={12}>
            <Form.Item label="??????">
              {getFieldDecorator('source_id', { rules: [{ required: true, message: '??????' }] })(
                <Select>
                  {source.map(item => (
                    <Option key={item.id} value={item.id}>
                      {item.description}
                    </Option>
                  ))}
                </Select>,
              )}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="??????">
              {getFieldDecorator('packages_id', {
                // rules: [{ required: true, message: '??????' }],
              })(
                <Select>
                  <Option key={0} value={0}>???</Option>
                  {packages.map(item => (
                    <Option key={item.id} value={item.id}>
                      {item.description}
                    </Option>
                  ))}
                </Select>,
              )}
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={8}>
          <Col span={12}>
            <Form.Item label="?????????">
              {getFieldDecorator('room_rate_code', {
                rules: [{ required: true, message: '?????????' }],
              })(<Input placeholder="?????????" />)}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="????????????">
              {getFieldDecorator('description', {
                rules: [{ required: true, message: '????????????' }],
              })(<Input placeholder="????????????" />)}
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={8}>
          <Col span={12}>
            <Form.Item label="?????????">
              {getFieldDecorator('description_en', {})(<Input placeholder="?????????" />)}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="????????????">
              {getFieldDecorator('is_private', { initialValue: '0' })(
                <Select>
                  <Option value="0">?????????</Option>
                  <Option value="1">??????</Option>
                </Select>,
              )}
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={8}>
          <Col span={12}>
            <Form.Item label="??????">
              {getFieldDecorator('date_start', {
                rules: [{ required: true, message: '??????' }],
              })(<DatePicker format="YYYY-MM-DD" />)}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="??????">
              {getFieldDecorator('date_end', { rules: [{ required: true, message: '??????' }] })(
                <DatePicker format="YYYY-MM-DD" />,
              )}
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={8}>
          <Col span={12}>
            <Form.Item label="??????">
              {getFieldDecorator('memo', {})(<Input placeholder="??????" />)}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="??????">
              {getFieldDecorator('list_order', {})(<InputNumber placeholder="??????" />)}
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default Form.create()(RoomRateMoal);
