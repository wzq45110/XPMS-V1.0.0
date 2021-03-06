import { Modal, Row, Col, Input, Form, Select, message, DatePicker } from 'antd';
import { useEffect, useState } from 'react';
import Constants from '@/constans';
import moment from 'moment';
import { addCompany, updateCompany } from '@/services/company';
import { getMarket } from '@/services/checkIn';

const { Option } = Select;

const CompanyModal = props => {
  useEffect(() => {
    if (props.visible) {
      if (props.formValues) {
        const {
          code_base_id,
          name,
          market_id,
          phone,
          fax,
          email,
          linkman,
          occupation,
          birth,
          city,
          representative,
          company,
          taxpayer_no,
          address,
          telPhone,
          bank_name,
          bank_account,
          tax_emai,
          ar_account,
          account_limit,
          account_balance,
          memo,
        } = props.formValues;
        props.form.setFieldsValue({
          code_base_id,
          name,
          market_id,
          phone,
          fax,
          email,
          linkman,
          occupation,
          birth: moment(birth),
          city,
          representative,
          company,
          taxpayer_no,
          address,
          telPhone,
          bank_name,
          bank_account,
          tax_emai,
          ar_account,
          account_limit,
          account_balance,
          memo,
        });
      } else {
        props.form.resetFields();
      }
    }
  }, [props.visible]);

  const formItemLayout = {
    labelCol: {
      xs: { span: 12 },
      sm: { span: 10 },
    },
    wrapperCol: {
      xs: { span: 12 },
      sm: { span: 14 },
    },
  };

  const {
    form: { getFieldDecorator },
  } = props;

  const handleSubmit = () => {
    props.form.validateFields((err, fieldsValue) => {
      if (err == null) {
        console.log(fieldsValue);
        fieldsValue.birth = fieldsValue.birth && fieldsValue.birth.format('YYYY-MM-DD HH:mm:ss');

        let currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
        const { hotel_group_id, hotel_id, id: create_user } = currentUser;
        if (props.isAdd) {
          setLoading(true);
          addCompany([
            { ...fieldsValue, hotel_group_id, hotel_id, create_user, modify_user: create_user },
          ]).then(rsp => {
            setLoading(false);
            if (rsp && rsp.code == Constants.SUCCESS) {
              message.success(rsp.message || '????????????');
              props.handleCancel(true);
            }
          });
        } else {
          setLoading(true);
          updateCompany([
            { ...fieldsValue, id: props.formValues.id, modify_user: create_user },
          ]).then(rsp => {
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

  useEffect(() => {
    getMarket().then(rsp => {
      if (rsp && rsp.code == Constants.SUCCESS) {
        const data = rsp.data || [];
        setMarket(data);
      }
    });
  }, []);

  const [market, setMarket] = useState([]);

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
        <Row gutter={8} type="flex">
          <Col span={12}>
            <Form.Item label="??????">
              {getFieldDecorator('code_base_id', {
                rules: [{ required: true, message: '??????' }],
              })(
                <Select>
                  <Option key={38} value={38}>
                    ????????????
                  </Option>
                  <Option key={39} value={39}>
                    ???/???
                  </Option>
                </Select>,
              )}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="??????">
              {getFieldDecorator('name', {
                rules: [{ required: true, message: '??????' }],
              })(<Input />)}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="????????????">{getFieldDecorator('company', {})(<Input />)}</Form.Item>
          </Col>
          <Col span={12}>
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
          </Col>
          <Col span={12}>
            <Form.Item label="??????">{getFieldDecorator('city', {})(<Input />)}</Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="??????">{getFieldDecorator('address', {})(<Input />)}</Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="??????">{getFieldDecorator('phone', {})(<Input />)}</Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="??????">{getFieldDecorator('fax', {})(<Input />)}</Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="??????">{getFieldDecorator('email', {})(<Input />)}</Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="?????????">{getFieldDecorator('linkman', {})(<Input />)}</Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="???????????????">
              {getFieldDecorator('occupation', {})(<Input />)}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="???????????????">
              {getFieldDecorator('birth', {})(<DatePicker format="YYYY-MM-DD" />)}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="?????????">
              {getFieldDecorator('representative', {})(<Input />)}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="??????????????????">
              {getFieldDecorator('taxpayer_no', {})(<Input />)}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="???????????????">{getFieldDecorator('telPhone', {})(<Input />)}</Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="???????????????">{getFieldDecorator('tax_emai', {})(<Input />)}</Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="?????????">{getFieldDecorator('bank_name', {})(<Input />)}</Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="??????">{getFieldDecorator('bank_account', {})(<Input />)}</Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="AR??????">
              {getFieldDecorator(
                'ar_account',
                {},
              )(
                <Select>
                  <Option key={'0'} value={'0'}>
                    ???
                  </Option>
                  <Option key={'1'} value={'1'}>
                    ???
                  </Option>
                </Select>,
              )}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="????????????">
              {getFieldDecorator('account_limit', {})(<Input />)}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="??????">
              {getFieldDecorator('account_balance', {})(<Input />)}
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

export default Form.create()(CompanyModal);
