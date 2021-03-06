import { Modal, Row, Col, Input, Form, message, DatePicker, Select } from 'antd';
import { useEffect, useState } from 'react';
import { saveCodeAccount, updateCodeAccount } from '@/services/system/codeConfig';
import Constants from '@/constans';
import moment from 'moment';
import Dict from '@/dictionary';
import { getAccountDetailType } from '@/services/account';

const { Option } = Select;

const AccountMoal = props => {
  useEffect(() => {
    if (props.visible) {
      if (props.formValues) {
        const {
          account_type,
          account_code,
          description,
          description_en,
          memo,
          date_start,
          date_end,
          account_detail_type,
        } = props.formValues;
        props.form.setFieldsValue({
          account_type,
          account_code,
          description,
          description_en,
          memo,
          date_start: moment(date_start),
          date_end: moment(date_end),
          account_detail_type,
        });
      } else {
        props.form.resetFields();
      }
    }
  }, [props.visible]);

  useEffect(() => {
    getAccountDetailType().then(rsp => {
      if (rsp && rsp.code == Constants.SUCCESS) {
        const data = rsp.data || [];
        setDetailTypes(data);
        setAllDetailTypes(data);
        let xf = [];
        let fk = [];
        let tk = [];
        let ys = [];
        data.map(item => {
          if (item.types.includes('XF')) {
            xf.push(item);
          }
          if (item.types.includes('FK')) {
            fk.push(item);
          }
          if (item.types.includes('TK')) {
            tk.push(item);
          }
          if (item.types.includes('YS')) {
            ys.push(item);
          }
        });
        setXfDetailTypes(xf);
        setFkDetailTypes(fk);
        setTkDetailTypes(tk);
        setYsDetailTypes(ys);
      } else {
        setDetailTypes([]);
        setAllDetailTypes([]);
        setXfDetailTypes([]);
        setFkDetailTypes([]);
        setTkDetailTypes([]);
        setYsDetailTypes([]);
      }
    });
  }, []);

  const [detailTypes, setDetailTypes] = useState([]);
  const [allDetailTypes, setAllDetailTypes] = useState([]);
  const [xfDetailTypes, setXfDetailTypes] = useState([]);
  const [fkDetailTypes, setFkDetailTypes] = useState([]);
  const [tkDetailTypes, setTkDetailTypes] = useState([]);
  const [ysDetailTypes, setYsDetailTypes] = useState([]);

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
        fieldsValue.date_start =
          fieldsValue.date_start && fieldsValue.date_start.format('YYYY-MM-DD HH:mm:ss');
        fieldsValue.date_end =
          fieldsValue.date_end && fieldsValue.date_end.format('YYYY-MM-DD HH:mm:ss');

        if (fieldsValue.account_type) {
          Dict.accountType.map(item => {
            if (item.code == fieldsValue.account_type) {
              fieldsValue.credit_debit = item.credit_debit;
            }
          });
        }

        let currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
        const { hotel_group_id, hotel_id, id: create_user } = currentUser;
        const modify_user = create_user;
        if (props.isAdd) {
          setLoading(true);
          saveCodeAccount([
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
          updateCodeAccount([{ ...fieldsValue, id: props.formValues.id, modify_user }]).then(
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

  const handleAccountTypeCg = value => {
    let details = [...detailTypes];
    if (value == 'XF') {
      details = [...xfDetailTypes];
    } else if (value == 'FK') {
      details = [...fkDetailTypes];
    } else if (value == 'TK') {
      details = [...tkDetailTypes];
    } else if (value == 'YS') {
      details = [...ysDetailTypes];
    }
    setDetailTypes(details);
    props.form.setFieldsValue({ account_detail_type: null });
  };

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
            <Form.Item label="????????????">
              {getFieldDecorator('account_type', {
                rules: [{ required: true, message: '???????????????' }],
              })(
                <Select onChange={value => handleAccountTypeCg(value)}>
                  {Dict.accountType.map(item => (
                    <Option key={item.code} value={item.code}>
                      {item.name}
                    </Option>
                  ))}
                </Select>,
              )}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="????????????">
              {getFieldDecorator('account_detail_type', {
                rules: [{ required: true, message: '???????????????' }],
              })(
                <Select>
                  {detailTypes.map(item => (
                    <Option key={item.code} value={item.code}>
                      {item.description}
                    </Option>
                  ))}
                </Select>,
              )}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="??????">
              {getFieldDecorator('account_code', {
                rules: [{ required: true, message: '??????' }],
              })(<Input placeholder="??????" />)}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="??????">
              {getFieldDecorator('description', { rules: [{ required: true, message: '??????' }] })(
                <Input placeholder="??????" />,
              )}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="????????????">
              {getFieldDecorator('description_en', {})(<Input placeholder="????????????" />)}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="??????">
              {getFieldDecorator('date_start', { rules: [{ required: true, message: '??????' }] })(
                <DatePicker format="YYYY-MM-DD" />,
              )}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="??????">
              {getFieldDecorator('date_end', {
                rules: [{ required: true, message: '??????' }],
              })(<DatePicker format="YYYY-MM-DD" />)}
            </Form.Item>
          </Col>
          {/* <Col span={12}>
            <Form.Item label="?????????">
              {getFieldDecorator(
                'credit_debit',
                {},
              )(
                <Select>
                  <Option value={'2'}>??????</Option>
                  <Option value={'1'}>??????</Option>
                </Select>,
              )}
            </Form.Item>
          </Col> */}
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

export default Form.create()(AccountMoal);
