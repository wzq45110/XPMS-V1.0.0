import styles from './style.less';
import { Row, Col, Input, Select, Button, Form, DatePicker, message, Modal } from 'antd';
import { useState } from 'react';
import moment from 'moment';
import { checkInSubmit, scanCard, upGuestBase } from '@/services/checkIn';
import { removeOrderGuest } from '@/services/order';
import { connect } from 'dva';
import Constants from '@/constans';
import { useEffect } from 'react';
import Dict from '@/dictionary';
import { getLocalIp } from '@/utils/ipUtil';
import socket from '@/utils/socket/socket';
import { getSenseTimeDevice } from '@/services/global';
import { getequipmentconfiglist } from '@/services/equipment';
import AddMember from './AddMember';
const { Option } = Select;
const { confirm } = Modal;

const GuestInfoPanel = props => {
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

  const handleSubmit = e => {
    e.preventDefault();
    props.form.validateFields((err, values) => {
      if (!err) {
        console.log(values);

        const order = {
          orderInfoGuest: [
            {
              id: props.isNew ? null : props.id,
              guest_base_id: guestBaseId,
              phone_number: values.phone_number,
              order_info_id: props.orderInfo && props.orderInfo.id,
              // member_no: values.member_no,
              face_image: faceImage,
              // credential_image: credentialImage,
            },
          ],
        };

        console.log(order);

        const { dispatch } = props;
        if (dispatch) {
          dispatch({
            type: 'global/changeLoading',
            payload: true,
          });
          checkInSubmit(order).then(rsp => {
            dispatch({
              type: 'global/changeLoading',
              payload: false,
            });
            if (rsp && rsp.code == Constants.SUCCESS) {
              console.log(rsp);
              message.info('????????????');
            }
          });
        }
      }
    });
  };

  const handleRemove = e => {
    confirm({
      title: '?????????????',
      content: '????????????????????????????',
      okText: '??????',
      cancelText: '??????',
      onOk: () => {
        if (props.id) {
          // const order = {
          //   orderInfoGuest: [
          //     {
          //       id: props.id,
          //       guest_base_id: guestBaseId,
          //       order_info_id: props.order_info_id,
          //       valid: '0',
          //     },
          //   ],
          // };
          // console.log(order);
          const { dispatch } = props;
          if (dispatch) {
            dispatch({
              type: 'global/changeLoading',
              payload: true,
            });
            removeOrderGuest(props.id).then(rsp => {
              dispatch({
                type: 'global/changeLoading',
                payload: false,
              });
              if (rsp && rsp.code == Constants.SUCCESS) {
                console.log(rsp);
                message.info('????????????');
              }
            });
          }
        }
      },
    });
  };

  const handelIdCardChange = e => {
    const idCardNoReg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
    const value = e.target.value;
    if (idCardNoReg.test(value) === true) {
      const {
        form: { setFieldsValue, getFieldValue },
      } = props;
      const sexStr = value.charAt(value.length - 2);
      let sex;
      if (parseInt(sexStr) % 2 == 0) {
        sex = '2';
      } else {
        sex = '1';
      }
      const birth = value.substring(6, 14);
      const birthday = moment(birth);
      setFieldsValue({
        sex,
        birthday,
      });

      const name = getFieldValue('name');
      const credential_type = getFieldValue('credential_type');
      const address = getFieldValue('address');
      if (name) {
        upGuestBaseInfo({
          name,
          sex,
          birthday: moment(birth).format('YYYY-MM-DD HH:mm:ss'),
          credential_type,
          credential_no: value,
          address,
        });
      }
    }
  };

  const handelAddressChange = () => {
    const {
      form: { getFieldValue },
    } = props;
    const address = getFieldValue('address');
    if (address) {
      const credential_no = getFieldValue('credential_no');
      if (credential_no) {
        upGuestBaseInfo({
          credential_no,
          address,
        });
      }
    }
  };

  const [guestBaseId, setGuestBaseId] = useState(props.guest_base_id);
  const [faceImage, setFaceImage] = useState();
  const [scanType, setScanType] = useState(Dict.cardScan);

  const [addMemberVis, setAddMemberVis] = useState(false);
  const [phone, setPhone] = useState(null);

  useEffect(() => {
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
      //         console.log(this);
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

  const handleScanCard = () => {
    if (scanType == Dict.cardScan) {
      erDaiZhengScan();
    }
  };

  const erDaiZhengScan = () => {
    scanCard().then(rsp => {
      console.log(rsp);
      if (rsp && rsp.code == '0') {
        const {
          form: { setFieldsValue },
        } = props;

        const {
          name,
          nation,
          born,
          CardType,
          cardno: credential_no,
          address,
          photobase64: credential_image,
        } = rsp || {};
        const credential_type = CardType == '0' ? '1' : CardType;
        const sex = rsp.sex == '???' ? '1' : '2';
        setFieldsValue({
          credential_type,
          name,
          credential_no,
          sex,
          birthday: moment(born),
          address: rsp.address,
        });

        upGuestBaseInfo({
          name,
          sex,
          nation,
          birthday: moment(born).format('YYYY-MM-DD HH:mm:ss'),
          credential_type,
          credential_no,
          credential_validate_start: moment(rsp.userlifeb).format('YYYY-MM-DD HH:mm:ss'),
          credential_validate_end: moment(rsp.userlifee).format('YYYY-MM-DD HH:mm:ss'),
          address,
          credential_image,
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
        const { guest_base_id, face_image } = rsp.data || {};
        setGuestBaseId(guest_base_id);
        setFaceImage(face_image);
      }
    });
  };

  const handleAddMember = () => {
    const {
      form: { getFieldValue },
    } = props;
    const phoneNo = getFieldValue('phone_number');
    setPhone(phoneNo);
    setAddMemberVis(true);
  };

  return (
    <>
      <Form {...formItemLayout} className={styles.panelForm} onSubmit={handleSubmit}>
        <Form.Item label="??????">
          {getFieldDecorator('name', {
            rules: [
              {
                required: true,
                message: '???????????????',
              },
            ],
            initialValue: props.name,
          })(<Input disabled={!props.canDel} />)}
        </Form.Item>
        <Form.Item label="????????????">
          {getFieldDecorator('credential_type', {
            rules: [
              {
                required: true,
                message: '?????????????????????',
              },
            ],
            initialValue: props.credential_type,
          })(
            <Select disabled={!props.canDel}>
              <Option value={'1'}>?????????</Option>
              <Option value={'2'}>??????</Option>
            </Select>,
          )}
        </Form.Item>
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
            initialValue: props.credential_no,
          })(<Input onChange={e => handelIdCardChange(e)} disabled={!props.canDel} />)}
        </Form.Item>
        <Form.Item label="??????">
          {getFieldDecorator('sex', {
            rules: [
              {
                required: true,
                message: '???????????????',
              },
            ],
            initialValue: props.sex,
          })(
            <Select disabled={!props.canDel}>
              <Option value={'1'}>???</Option>
              <Option value={'2'}>???</Option>
            </Select>,
          )}
        </Form.Item>
        <Form.Item label="??????">
          {getFieldDecorator('birthday', {
            initialValue: props.birthday && moment(props.birthday),
          })(<DatePicker disabled={!props.canDel} />)}
        </Form.Item>
        <Form.Item label="??????">
          {getFieldDecorator('address', { initialValue: props.address })(
            <Input onBlur={() => handelAddressChange()} />,
          )}
        </Form.Item>
        <Form.Item label="?????????">
          {getFieldDecorator('phone_number', { initialValue: props.phone_number })(<Input />)}
        </Form.Item>
        {/* <Form.Item label="?????????">{getFieldDecorator('member_no', {})(<Input />)}</Form.Item> */}

        {props.orderInfo &&
          props.orderInfo.status &&
          (props.orderInfo.status == 'I' ||
            props.orderInfo.status == 'R' ||
            props.orderInfo.status == 'RG') && (
            <Form.Item wrapperCol={{ span: 24 }} style={{ textAlign: 'center' }}>
              <Button type="primary" htmlType="submit" style={{ marginLeft: '10px' }}>
                ??????
              </Button>
              {props.canDel ? (
                <Button style={{ marginLeft: '10px' }} onClick={handleScanCard}>
                  ??????
                </Button>
              ) : (
                <Button style={{ marginLeft: '10px' }} onClick={handleAddMember}>
                  ????????????
                </Button>
              )}
              <Button style={{ marginLeft: '10px' }} onClick={handleRemove}>
                ??????
              </Button>
            </Form.Item>
          )}
      </Form>

      <AddMember
        visible={addMemberVis}
        guestBaseId={guestBaseId}
        phone={phone}
        handleCancel={() => setAddMemberVis(false)}
      />
    </>
  );
};

export default connect(({ global }) => ({ loading: global.loading }))(
  Form.create()(GuestInfoPanel),
);
