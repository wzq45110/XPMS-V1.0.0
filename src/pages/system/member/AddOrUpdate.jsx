import { Modal, Row, Col, Input, Form, Select, message, DatePicker, InputNumber, Icon } from 'antd';
import { useEffect, useState } from 'react';
import Constants from '@/constans';
import moment from 'moment';
import { upGuestBase, scanCard } from '@/services/checkIn';
import {
  getMemberLevel,
  addMember,
  updateMember,
  getMembers,
  checkMemberCard,
} from '@/services/member';
import Dict from '@/dictionary';
import { getLocalIp } from '@/utils/ipUtil';
import socket from '@/utils/socket/socket';
import { getSenseTimeDevice } from '@/services/global';
import { getequipmentconfiglist } from '@/services/equipment';

const { Option } = Select;

const AddOrUpdate = props => {
  useEffect(() => {
    if (props.visible) {
      if (props.formValues) {
        const {
          name,
          sex,
          credential_type,
          credential_no,
          birthday,
          address,
          member_no,
          member_level_id,
          score,
          phone,
          email,
          company,
          card_type,
          card_no,
          // balance,
          // deposit,
          memo,
        } = props.formValues;
        props.form.setFieldsValue({
          name,
          sex,
          credential_type,
          credential_no,
          birthday: moment(birthday),
          address,
          member_no,
          member_level_id,
          score,
          phone,
          email,
          company,
          card_type,
          card_no,
          // balance,
          // deposit,
          memo,
        });
      } else {
        props.form.resetFields();
      }
    }
  }, [props.visible]);

  useEffect(() => {
    getMemberLevel().then(rsp => {
      if (rsp && rsp.code == Constants.SUCCESS) {
        const data = rsp.data || [];
        setMemberLevel(data);
      }
    });

    const config = JSON.parse(sessionStorage.getItem('config')) || {};
    const scanConf = config[Dict.scanCardConfCode] && config[Dict.scanCardConfCode].code;
    if (scanConf) {
      setScanType(scanConf);
    }
    if (scanConf == Dict.peopleCard) {
      // getLocalIp(ip => {
      //   console.log(ip);
      //   let pattern = /((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})(\.((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})){3}/g;
      //   if (pattern.test(ip)) {
      //     getSenseTimeDevice(ip).then(rsp => {
      //       if (rsp && rsp.code == Constants.SUCCESS) {
      //         const device_id = rsp.data.device_id;
      //         socket.created({ id: device_id, onMessage: onSocketMsg });
      //       }
      //     });
      //   } else {
      //     socket.created({ id: 'SID020S19E00530', onMessage: onSocketMsg });
      //   }
      // });

      getequipmentconfiglist().then(rsp => {
        if (rsp.code && rsp.code == Constants.SUCCESS) {
          const data = rsp.data || [];
          if (data.length > 0) {
            const device_id = data[0].device_id;
            socket.created({ id: device_id, onMessage: onSocketMsg });
          }
        }
      });
      // socket.created({ id: 'SID020S19E00530', onMessage: onSocketMsg });
    }
  }, []);

  const onSocketMsg = e => {
    console.log(e.data);
    const msg = JSON.parse(e.data);
    const guest_base = msg.guest_base || {};

    const {
      id: guestBaseId,
      name,
      credential_no,
      credential_type,
      sex,
      birthday,
      address,
    } = guest_base;
    const {
      form: { setFieldsValue },
    } = props;
    setFieldsValue({
      credential_type,
      name,
      credential_no,
      sex,
      birthday: moment(birthday),
      address,
    });

    setGuestBaseId(guestBaseId);
  };

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

        const {
          member_no,
          member_level_id,
          score,
          phone,
          email,
          company,
          // balance,
          card_no,
          card_type,
          // deposit,
          memo,
        } = fieldsValue;

        let currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
        const { hotel_group_id, hotel_id, id: create_user } = currentUser;

        if (props.isAdd) {
          if (!guestBaseId) {
            message.error('????????????????????????,????????????????????????');
            return;
          }

          const data = {
            member: {
              hotel_group_id,
              hotel_id,
              guest_base_id: guestBaseId,
              member_no,
              member_level_id,
              score,
              phone,
              email,
              company,
              create_user,
              modify_user: create_user,
              memo,
            },
            card: {
              // balance,
              card_no,
              card_type,
              // deposit,
              hotel_group_id,
              hotel_id,
              create_user,
              modify_user: create_user,
            },
          };
          console.log(data);
          setLoading(true);

          addMember(data).then(rsp => {
            setLoading(false);
            if (rsp && rsp.code == Constants.SUCCESS) {
              message.success(rsp.message || '????????????');
              props.handleCancel(true);
            }
          });
        } else {
          const member = {
            id: props.formValues.member_info_id,
            member_level_id,
            phone,
            email,
            company,
            modify_user: create_user,
            memo,
          };
          console.log(member);
          setLoading(true);
          updateMember(member).then(rsp => {
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
  const [guestBaseId, setGuestBaseId] = useState(null);
  const [memberLevel, setMemberLevel] = useState([]);
  const [scanType, setScanType] = useState(Dict.cardScan);

  const handleScanCard = () => {
    if (scanType == Dict.cardScan) {
      erDaiZhengScan();
    }
  };

  const erDaiZhengScan = () => {
    scanCard().then(rsp => {
      if (rsp && rsp.code == '0') {
        console.log(rsp);

        const { name, cardno: credential_no, nation, address, photobase64: credential_image } = rsp;

        const record = {
          name,
          credential_type: '1',
          credential_no,
          nation,
          address,
          credential_image,
        };
        record.sex = rsp.sex == '???' ? '1' : '2';
        record.birthday = moment(rsp.born).format('YYYY-MM-DD HH:mm:ss');
        record.credential_validate_start = moment(rsp.userlifeb).format('YYYY-MM-DD HH:mm:ss');
        record.credential_validate_end = moment(rsp.userlifee).format('YYYY-MM-DD HH:mm:ss');
        upGuestBaseInfo(record);

        const {
          form: { setFieldsValue },
        } = props;
        setFieldsValue({
          name,
          sex: record.sex,
          credential_no,
          birthday: moment(rsp.born),
          address,
        });
      }
    });
  };

  const upGuestBaseInfo = record => {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    const { id: create_user } = currentUser || {};
    upGuestBase({ ...record, create_user, modify_user: create_user }).then(rsp => {
      console.log(rsp);
      if (rsp && rsp.code == Constants.SUCCESS) {
        setGuestBaseId(rsp.data && rsp.data.guest_base_id);
      } else {
        setGuestBaseId(null);
      }
    });
  };

  const handleIdCardChange = e => {
    props.form.validateFields(['credential_no'], (err, fieldsValue) => {
      if (err == null) {
        const value = e.target.value;
        console.log(value);

        let sex = '1';
        const sexStr = value.charAt(value.length - 2);
        if (parseInt(sexStr) % 2 == 0) {
          sex = '2';
        } else {
          sex = '1';
        }
        const birth = value.substring(6, 14);

        const {
          form: { setFieldsValue, getFieldValue },
        } = props;
        setFieldsValue({
          sex,
          birthday: moment(birth),
        });
        const name = getFieldValue('name');
        const credential_type = getFieldValue('credential_type');
        const credential_no = value;
        const address = getFieldValue('address');
        const birthday = moment(birth).format('YYYY-MM-DD HH:mm:ss');
        const record = {
          name,
          sex,
          credential_type,
          credential_no,
          address,
          birthday,
        };
        upGuestBaseInfo(record);
      }
    });
  };

  const checkMemberNo = () => {
    const {
      form: { getFieldValue },
    } = props;
    const member_no = getFieldValue('member_no');
    if (member_no) {
      getMembers({ member_no }).then(rsp => {
        if (rsp && rsp.code == Constants.SUCCESS) {
          const data = rsp.data;
          if (data && data.length > 0) {
            message.error('????????????????????????');
          }
        }
      });
    }
  };

  const checkCardNo = () => {
    const {
      form: { getFieldValue },
    } = props;
    const card_no = getFieldValue('card_no');
    if (card_no) {
      checkMemberCard({ card_no }).then(rsp => {
        if (rsp && rsp.code == Constants.SUCCESS) {
          const data = rsp.data;
          if (data && data.length > 0) {
            message.error('????????????????????????');
          }
        }
      });
    }
  };

  return (
    <Modal
      title="?????????"
      visible={props.visible}
      onCancel={() => props.handleCancel()}
      onOk={handleSubmit}
      confirmLoading={loading}
      width={720}
    >
      <Form {...formItemLayout}>
        <Row gutter={8} type="flex">
          <Col span={12}>
            <Form.Item label="??????">
              {props.isAdd ? (
                <>
                  {getFieldDecorator('name', {
                    rules: [
                      {
                        required: true,
                        message: '???????????????',
                      },
                    ],
                  })(<Input style={{ width: '80%' }} />)}
                  <Icon
                    type="idcard"
                    onClick={() => {
                      handleScanCard();
                    }}
                    style={{ cursor: 'pointer', marginLeft: '5px', fontSize: '20px' }}
                  />
                </>
              ) : (
                <>
                  {getFieldDecorator('name', {
                    rules: [
                      {
                        required: true,
                        message: '???????????????',
                      },
                    ],
                  })(<Input disabled />)}
                </>
              )}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="??????">
              {getFieldDecorator(
                'sex',
                {},
              )(
                <Select disabled={!props.isAdd}>
                  <Option value={'1'}>???</Option>
                  <Option value={'2'}>???</Option>
                </Select>,
              )}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="????????????">
              {getFieldDecorator('credential_type', { initialValue: '1' })(
                <Select disabled={!props.isAdd}>
                  <Option value={'1'}>?????????</Option>
                </Select>,
              )}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="????????????">
              {getFieldDecorator('credential_no', {
                rules: [
                  {
                    required: true,
                    message: '?????????????????????',
                  },
                  {
                    pattern: /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/,
                    message: '???????????????????????????',
                  },
                ],
              })(<Input onBlur={e => handleIdCardChange(e)} disabled={!props.isAdd} />)}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="????????????">
              {getFieldDecorator(
                'birthday',
                {},
              )(
                <DatePicker
                  format="YYYY-MM-DD"
                  style={{ width: '100%' }}
                  disabled={!props.isAdd}
                />,
              )}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="??????">
              {getFieldDecorator('address', {})(<Input disabled={!props.isAdd} />)}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="????????????">
              {getFieldDecorator('member_no', {
                rules: [
                  {
                    required: true,
                    message: '????????????',
                  },
                ],
              })(<Input disabled={!props.isAdd} onBlur={() => checkMemberNo()} />)}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="????????????">
              {getFieldDecorator(
                'member_level_id',
                {},
              )(
                // <Select disabled={!props.isAdd}>
                <Select>
                  {memberLevel.map(item => (
                    <Option key={item.id} value={item.id}>
                      {item.description}
                    </Option>
                  ))}
                </Select>,
              )}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="????????????">
              {getFieldDecorator(
                'score',
                {},
              )(<InputNumber style={{ width: '100%' }} disabled={!props.isAdd} />)}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="??????">
              {getFieldDecorator('phone', {
                rules: [
                  {
                    required: true,
                    message: '???????????????',
                  },
                ],
              })(<Input />)}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="??????">{getFieldDecorator('email', {})(<Input />)}</Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="????????????">{getFieldDecorator('company', {})(<Input />)}</Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="???????????????">
              {getFieldDecorator('card_type', {
                // rules: [
                //   {
                //     required: true,
                //     message: '???????????????',
                //   },
                // ],
              })(<Input disabled={!props.isAdd} />)}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="???????????????">
              {getFieldDecorator('card_no', {
                rules: [
                  {
                    required: true,
                    message: '???????????????',
                  },
                ],
              })(<Input disabled={!props.isAdd} onBlur={() => checkCardNo()} />)}
            </Form.Item>
          </Col>
          {/* <Col span={12}>
            <Form.Item label="??????">
              {getFieldDecorator('balance', { initialValue: 0 })(
                <InputNumber style={{ width: '100%' }} disabled={!props.isAdd} />,
              )}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="??????">
              {getFieldDecorator('deposit', { initialValue: 0 })(
                <InputNumber style={{ width: '100%' }} disabled={!props.isAdd} />,
              )}
            </Form.Item>
          </Col> */}
          <Col span={12}>
            <Form.Item label="??????">{getFieldDecorator('memo', {})(<Input />)}</Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default Form.create()(AddOrUpdate);
