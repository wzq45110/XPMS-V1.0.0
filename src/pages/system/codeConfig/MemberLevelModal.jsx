import { Modal, Row, Col, Input, Form, Select, message, InputNumber, DatePicker } from 'antd';
import { useEffect, useState } from 'react';
import Constants from '@/constans';
import { getMarket } from '@/services/checkIn';
import moment from 'moment';
import { saveMemberLevel, updateMemberLevel } from '@/services/system/codeConfig';
const { Option } = Select;

const MarketMoal = props => {
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
          code,
          description,
          description_en,
          // market_id,
          is_private,
          integral_radio,
          date_start,
          date_end,
          memo,
        } = props.formValues;
        props.form.setFieldsValue({
          code,
          description,
          description_en,
          // market_id,
          is_private,
          integral_radio,
          date_start: moment(date_start),
          date_end: moment(date_end),
          memo,
        });
      } else {
        props.form.resetFields();
      }
    }
  }, [props.visible]);

  // useEffect(() => {
  //   getMarket().then(rsp => {
  //     if (rsp && rsp.code == Constants.SUCCESS) {
  //       const data = rsp.data || [];
  //       setMarket(data);
  //     }
  //   });
  // }, []);

  // const [market, setMarket] = useState([]);
  const [loading, setLoading] = useState(false);

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
          saveMemberLevel([
            { ...fieldsValue, hotel_group_id, hotel_id, create_user, modify_user },
          ]).then(rsp => {
            setLoading(false);
            if (rsp && rsp.code == Constants.SUCCESS) {
              message.success(rsp.message || '????????????');
              props.handleCancel(true);
            }
          });
        } else {
          setLoading(true);
          updateMemberLevel([{ ...fieldsValue, id: props.formValues.id, modify_user }]).then(
            rsp => {
              setLoading(false);
              if (rsp && rsp.code == Constants.SUCCESS) {
                message.success(rsp.message || '????????????');
                props.handleCancel(true);
              }
            },
          );
        }
      }
    });
  };

  return (
    <Modal
      title="????????????"
      visible={props.visible}
      onCancel={() => props.handleCancel()}
      onOk={() => handleSubmit()}
      confirmLoading={loading}
    >
      <Form {...formItemLayout}>
        <Row gutter={8} type="flex">
          <Col span={12}>
            <Form.Item label="??????">
              {getFieldDecorator('code', {
                rules: [{ required: true, message: '???????????????' }],
              })(<Input placeholder="??????" />)}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="??????">
              {getFieldDecorator('description', {
                rules: [{ required: true, message: '??????' }],
              })(<Input placeholder="??????" />)}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="??????">
              {getFieldDecorator('description_en', {})(<Input placeholder="??????" />)}
            </Form.Item>
          </Col>
          {/* <Col span={12}>
            <Form.Item label="??????">
              {getFieldDecorator('market_id', {
                rules: [{ required: true, message: '???????????????' }],
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
          </Col> */}
          <Col span={12}>
            <Form.Item label="????????????">
              {getFieldDecorator('is_private', {
                initialValue: '0',
              })(
                <Select>
                  <Option value={'0'}>?????????</Option>
                  <Option value={'1'}>??????</Option>
                </Select>,
              )}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="????????????">
              {getFieldDecorator('integral_radio', {
                rules: [{ required: true, message: '??????' }],
              })(<InputNumber style={{ width: '100%' }} />)}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="??????">
              {getFieldDecorator('date_start', {
                rules: [{ required: true, message: '??????' }],
              })(<DatePicker format="YYYY-MM-DD" />)}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="??????">
              {getFieldDecorator('date_end', {
                rules: [{ required: true, message: '??????' }],
              })(<DatePicker format="YYYY-MM-DD" />)}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="??????">
              {getFieldDecorator('memo', {})(<Input placeholder="??????" />)}
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default Form.create()(MarketMoal);
