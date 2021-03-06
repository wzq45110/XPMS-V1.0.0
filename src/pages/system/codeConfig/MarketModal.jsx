import { Modal, Row, Col, Input, Form, Select, message, TimePicker, InputNumber } from 'antd';
import { useEffect, useState } from 'react';
import { saveMarket, updateMarket } from '@/services/system/codeConfig';
import Constants from '@/constans';
import Dict from '@/dictionary';
import moment from 'moment';
import { getMemberLevel } from '@/services/member';

const { Option } = Select;

const MarketModal = props => {
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
          sys_dict_id,
          market_code,
          description,
          default_checkout_time,
          member_level_id,
          memo,
          line_up,
        } = props.formValues;
        if (member_level_id && sys_dict_id == Dict.guestType[1].id) {
          setIsMember(true);
        } else {
          setIsMember(false);
        }
        props.form.setFieldsValue({
          sys_dict_id,
          market_code,
          description,
          default_checkout_time: moment(default_checkout_time, 'HH:mm:ss'),
          memo,
          line_up,
        });
      } else {
        props.form.resetFields();
      }
    }
  }, [props.visible]);

  useEffect(() => {
    getMemberLevel().then(rsp => {
      if (rsp && rsp.code == Constants.SUCCESS) {
        setMemberLevels(rsp.data || []);
      }
    });
  }, []);

  const [loading, setLoading] = useState(false);
  const [memberLevels, setMemberLevels] = useState([]);
  const [isMember, setIsMember] = useState(false);

  const handleSubmit = () => {
    props.form.validateFields((err, fieldsValue) => {
      if (err == null) {
        fieldsValue.default_checkout_time =
          fieldsValue.default_checkout_time && fieldsValue.default_checkout_time.format('HH:mm:ss');

        let currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
        const { hotel_group_id, hotel_id, id: create_user } = currentUser;
        const modify_user = create_user;
        if (props.isAdd) {
          setLoading(true);
          saveMarket([{ ...fieldsValue, hotel_group_id, hotel_id, create_user, modify_user }]).then(
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
          updateMarket([{ ...fieldsValue, id: props.formValues.id, modify_user }]).then(rsp => {
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

  const handleGuestTypeChange = value => {
    if (value && value == Dict.guestType[1].id) {
      setIsMember(true);
    } else {
      setIsMember(false);
    }
  };

  return (
    <Modal
      title="??????"
      visible={props.visible}
      onCancel={() => props.handleCancel()}
      onOk={() => handleSubmit()}
      confirmLoading={loading}
    >
      <Form {...formItemLayout}>
        <Row gutter={8} type="flex">
          <Col span={12}>
            <Form.Item label="????????????">
              {getFieldDecorator('sys_dict_id', {
                rules: [{ required: true, message: '?????????????????????' }],
              })(
                <Select onChange={value => handleGuestTypeChange(value)}>
                  {Dict.guestType.map(item => (
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
              {getFieldDecorator('market_code', {
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
          {isMember && (
            <Col span={12}>
              <Form.Item label="????????????">
                {getFieldDecorator('member_level_id', {
                  rules: [{ required: true, message: '????????????' }],
                  initialValue: props.formValues && props.formValues.member_level_id,
                })(
                  <Select>
                    {memberLevels.map(item => (
                      <Option key={item.id} value={item.id}>
                        {item.description}
                      </Option>
                    ))}
                  </Select>,
                )}
              </Form.Item>
            </Col>
          )}

          <Col span={12}>
            <Form.Item label="????????????">
              {getFieldDecorator('default_checkout_time', {
                rules: [{ required: true, message: '????????????' }],
              })(<TimePicker format="HH:mm:ss" />)}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="??????">
              {getFieldDecorator('memo', {
                rules: [{ required: true, message: '????????????' }],
              })(<Input />)}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="??????">
              {getFieldDecorator('line_up', {})(<InputNumber placeholder="??????" />)}
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default Form.create()(MarketModal);
