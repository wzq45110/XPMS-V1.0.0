import { Modal, Row, Col, Input, Form, DatePicker, message } from 'antd';
import { useEffect, useState } from 'react';
import { updatePreferReason, addPreferReason } from '@/services/system/codeConfig';
import Constants from '@/constans';
import moment from 'moment';

const PreferReasonMoal = props => {
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
          prefer_code,
          description,
          description_en,
          date_start,
          date_end,
          memo,
        } = props.formValues;
        props.form.setFieldsValue({
          prefer_code,
          description,
          description_en,
          date_start: moment(date_start),
          date_end: moment(date_end),
          memo,
        });
      } else {
        props.form.resetFields();
      }
    }
  }, [props.visible]);

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
          addPreferReason([
            {
              ...fieldsValue,
              hotel_group_id,
              hotel_id,
              create_user,
              modify_user,
              sys_dict_id: 7,
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
          updatePreferReason([{ ...fieldsValue, id: props.formValues.id, modify_user }]).then(
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

  const [loading, setLoading] = useState(false);

  return (
    <Modal
      title="????????????"
      visible={props.visible}
      onCancel={() => props.handleCancel()}
      onOk={handleSubmit}
      confirmLoading={loading}
    >
      <Form {...formItemLayout}>
        <Row gutter={8}>
          <Col span={22} offset={-2}>
            <Form.Item label="??????">
              {getFieldDecorator('prefer_code', {
                rules: [{ required: true, message: '???????????????' }],
              })(<Input placeholder="??????" />)}
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={8}>
          <Col span={22} offset={-2}>
            <Form.Item label="????????????">
              {getFieldDecorator('description', {
                rules: [{ required: true, message: '????????????' }],
              })(<Input placeholder="????????????" />)}
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={8}>
          <Col span={22} offset={-2}>
            <Form.Item label="??????">
              {getFieldDecorator('description_en', {})(<Input placeholder="??????????????????" />)}
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={8}>
          <Col span={22} offset={-2}>
            <Form.Item label="????????????">
              {getFieldDecorator('date_start', {
                rules: [{ required: true, message: '????????????' }],
              })(<DatePicker showTime format="YYYY-MM-DD HH:mm:ss" />)}
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={8}>
          <Col span={22} offset={-2}>
            <Form.Item label="????????????">
              {getFieldDecorator('date_end', {
                rules: [{ required: true, message: '????????????' }],
              })(<DatePicker showTime format="YYYY-MM-DD HH:mm:ss" />)}
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={8}>
          <Col span={22} offset={-2}>
            <Form.Item label="??????">
              {getFieldDecorator('memo', {})(<Input placeholder="??????" />)}
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default Form.create()(PreferReasonMoal);
