import { Modal, Row, Col, Input, Form, InputNumber, message, Select, DatePicker } from 'antd';
import { useEffect, useState } from 'react';
import Constants from '@/constans';
import moment from 'moment';
import { saveSalesMan, updateSalesMan } from '@/services/system/codeConfig';

const { Option } = Select;

const SalesManModal = props => {
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
          name,
          is_fulltime,
          sex,
          age,
          birthday,
          telephone,
          fax,
          email,
          join_date,
          country,
          city,
          address1,
          address2,
          memo,
        } = props.formValues;
        props.form.setFieldsValue({
          code,
          name,
          is_fulltime,
          sex,
          age,
          birthday: birthday && moment(birthday),
          telephone,
          fax,
          email,
          join_date: join_date && moment(join_date),
          country,
          city,
          address1,
          address2,
          memo,
        });
      } else {
        props.form.resetFields();
      }
    }
  }, [props.visible]);

  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
    props.form.validateFields((err, fieldsValue) => {
      if (err == null) {
        fieldsValue.birthday =
          fieldsValue.birthday && fieldsValue.birthday.format('YYYY-MM-DD HH:mm:ss');
        fieldsValue.join_date =
          fieldsValue.join_date && fieldsValue.join_date.format('YYYY-MM-DD HH:mm:ss');

        let currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
        const { hotel_group_id, hotel_id, id: create_user } = currentUser;
        const modify_user = create_user;
        if (props.isAdd) {
          setLoading(true);
          saveSalesMan({ ...fieldsValue, hotel_group_id, hotel_id, create_user, modify_user }).then(
            rsp => {
              setLoading(false);
              if (rsp && rsp.code == Constants.SUCCESS) {
                message.success(rsp.message || '????????????');
                props.handleCancel(true);
              }
            },
          );
        } else {
          setLoading(true);
          updateSalesMan({ ...fieldsValue, id: props.formValues.id, modify_user }).then(rsp => {
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

  return (
    <Modal
      title="?????????"
      visible={props.visible}
      onCancel={() => props.handleCancel()}
      onOk={handleSubmit}
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
              {getFieldDecorator('name', {
                rules: [{ required: true, message: '??????' }],
              })(<Input placeholder="??????" />)}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="??????">
              {getFieldDecorator(
                'is_fulltime',
                {},
              )(
                <Select>
                  <Option value="1" key="1">
                    ???
                  </Option>
                  <Option value="0" key="0">
                    ???
                  </Option>
                </Select>,
              )}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="??????">
              {getFieldDecorator(
                'sex',
                {},
              )(
                <Select>
                  <Option value="1" key="1">
                    ???
                  </Option>
                  <Option value="2" key="2">
                    ???
                  </Option>
                </Select>,
              )}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="??????">
              {getFieldDecorator(
                'age',
                {},
              )(<InputNumber placeholder="??????" style={{ width: '100%' }} />)}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="????????????">
              {getFieldDecorator(
                'birthday',
                {},
              )(<DatePicker format="YYYY-MM-DD" style={{ width: '100%' }} />)}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="??????">
              {getFieldDecorator('telephone', {})(<Input placeholder="??????" />)}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="??????">
              {getFieldDecorator('fax', {})(<Input placeholder="??????" />)}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="??????">
              {getFieldDecorator('email', {})(<Input placeholder="??????" />)}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="??????">
              {getFieldDecorator('country', {})(<Input placeholder="??????" />)}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="??????">
              {getFieldDecorator('city', {})(<Input placeholder="??????" />)}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="??????1">
              {getFieldDecorator('address1', {})(<Input placeholder="??????1" />)}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="??????2">
              {getFieldDecorator('address2', {})(<Input placeholder="??????2" />)}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="????????????">
              {getFieldDecorator(
                'join_date',
                {},
              )(<DatePicker format="YYYY-MM-DD" style={{ width: '100%' }} />)}
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

export default Form.create()(SalesManModal);
