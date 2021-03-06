import Constants from '@/constans';
import Dict from '@/dictionary';
import { getSettleAccountType, closeSingleWithExtra } from '@/services/account';
import { getMemberCard } from '@/services/member';
import { checkOut } from '@/services/order';
import {
  Form,
  Select,
  DatePicker,
  Row,
  Col,
  Button,
  Input,
  InputNumber,
  Modal,
  message,
} from 'antd';
import { connect } from 'dva';
import { useEffect, useState } from 'react';
import styles from '../style.less';
const { Option } = Select;

const CheckOut = props => {
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

  const [accountCode, setAccountCode] = useState([]);
  const [memberAccount, setMemberAccount] = useState(null);
  const [isMember, setIsMember] = useState(false);
  const [memberCardId, setMemberCardId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [needAdd, setNeedAdd] = useState(true);

  useEffect(() => {
    getSettleAccountType(Dict.accountCode.FK).then(rsp => {
      if (rsp && rsp.code == Constants.SUCCESS) {
        const list = rsp.data || [];
        setAccountCode(list);

        const memberArr = list.filter(item => item.account_detail_type == Dict.accountCode.member);
        if (memberArr && memberArr.length > 0) {
          setMemberAccount(memberArr[0]);
        }
      }
    });
  }, []);

  const handleAccountCg = value => {
    if (value == memberAccount.id) {
      setIsMember(true);
    } else {
      setIsMember(false);
    }
  };

  const handleCardNoBlur = () => {
    const cardNo = props.form.getFieldValue('card_no');
    if (cardNo) {
      getMemberCard({ card_no: cardNo }).then(rsp => {
        if (rsp && rsp.code == Constants.SUCCESS) {
          const data = rsp.data || [];
          if (data[0]) {
            setMemberCardId(data[0].id);
            props.form.setFieldsValue({ balance: data[0].balance });
          }
        } else {
          setMemberCardId(null);
          props.form.setFieldsValue({ balance: 0 });
        }
      });
    } else {
      setMemberCardId(null);
      props.form.setFieldsValue({ balance: 0 });
    }
  };

  const handleNeedChange = value => {
    if (value == 1) {
      setNeedAdd(true);
    } else {
      setNeedAdd(false);
    }
  };

  const handleSubmit = () => {
    props.form.validateFields((err, values) => {
      if (!err) {
        const additional = props.record || {};
        // ????????? ????????????
        if (values.need != 1) {
          if (additional.orderid) {
            checkOut(additional.orderid).then(rsp => {
              if (rsp && rsp.code == Constants.SUCCESS) {
                message.success(rsp.message);
                props.handleCancel();
              }
            });
          }
          return;
        }

        // ??????????????????
        let account_detail_type = '';
        accountCode.map(item => {
          if (item.id == values.account_code_id) {
            account_detail_type = item.account_detail_type;
          }
        });

        let member_card_id = null;
        if (account_detail_type == Dict.accountCode.member) {
          if (values.charge > 0 && values.balance < values.charge) {
            message.error('?????????????????????');
            return;
          }
          if (!memberCardId) {
            message.error('????????????????????????');
            return;
          }
          member_card_id = memberCardId;
        }

        let currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
        const order = {
          order_info_id: additional.orderid,
          member_card_id,
          work_shift: currentUser.shift,
          account_detail_type,
        };

        setLoading(true);
        const { dispatch } = props;
        if (dispatch) {
          dispatch({
            type: 'global/changeLoading',
            payload: true,
          });
          closeSingleWithExtra(additional.id, order).then(rsp => {
            setLoading(false);
            dispatch({
              type: 'global/changeLoading',
              payload: false,
            });
            if (rsp && rsp.code == Constants.SUCCESS) {
              message.success(rsp.message || '????????????');
              props.handleCancel();
            }
          });
        }
      }
    });
  };

  return (
    <Modal
      title="??????"
      visible={props.visible}
      onOk={handleSubmit}
      onCancel={() => props.handleCancel()}
      width={800}
      confirmLoading={loading}
    >
      <Form {...formItemLayout}>
        <Row gutter={8} type="flex">
          <Col span={12}>
            <Form.Item label="????????????">
              {getFieldDecorator('add_charge', {
                initialValue: props.record && props.record.all_charge,
              })(<InputNumber disabled style={{ width: '100%' }} />)}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="????????????">
              {getFieldDecorator('need', { initialValue: 1 })(
                <Select onChange={value => handleNeedChange(value)}>
                  <Option key={1} value={1}>
                    ??????
                  </Option>
                  <Option key={0} value={0}>
                    ?????????
                  </Option>
                </Select>,
              )}
            </Form.Item>
          </Col>

          {needAdd && (
            <>
              <Col span={12}>
                <Form.Item label="????????????">
                  {getFieldDecorator(
                    'account_code_id',
                    {},
                  )(
                    <Select onChange={value => handleAccountCg(value)}>
                      {accountCode &&
                        accountCode.map(item => (
                          <Option key={item.id} value={item.id}>
                            {item.description}
                          </Option>
                        ))}
                    </Select>,
                  )}
                </Form.Item>
              </Col>
              {isMember && (
                <>
                  <Col span={12}>
                    <Form.Item label="????????????">
                      {getFieldDecorator(
                        'card_no',
                        {},
                      )(<Input onBlur={() => handleCardNoBlur()} />)}
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="????????????">
                      {getFieldDecorator('balance', {})(<Input disabled />)}
                    </Form.Item>
                  </Col>
                </>
              )}
              <Col span={12}>
                <Form.Item label="????????????">
                  {getFieldDecorator('pay_account_no', {})(<Input />)}
                </Form.Item>
              </Col>
            </>
          )}
        </Row>
      </Form>
    </Modal>
  );
};

export default connect(({ global }) => ({ loading: global.loading }))(Form.create()(CheckOut));
