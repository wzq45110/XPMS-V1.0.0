import styles from './style.less';
import { Row, Col, message, Modal } from 'antd';
import lySvg from '@/assets/order/ly.svg';
import lyDisSvg from '@/assets/order/lyDis.svg';
import classNames from 'classnames';
import { useState } from 'react';
// import CheckOut from './components/account/CheckOut';
import Settle from './components/account/Settle';
import Transfer from './components/account/Transfer';
import Entry from './components/account/Entry';
import OnAccount from './components/account/OnAccount';
import Reverse from './components/account/Reverse';
import Goods from './components/account/Goods';
import { cancelSettle, checkOut, closeSAccount, setMainOrderRoom } from '@/services/order';
import { useEffect } from 'react';
import { connect } from 'dva';
import Constants from '@/constans';
import OnSAccount from './components/account/OnSAccount';
import Pay from './components/account/Pay';
import SettleJoin from './components/account/SettleJoin';
import SettlePart from './components/account/SettlePart';
import { getAuditDate } from '@/services/audit';
import { openPostWindow } from '@/utils/openPost';
import CheckOutJoin from './components/CheckOutJoin';
import CheckOutConfirm from './components/CheckOutConfirm';
import CheckOut from './components/CheckOut';
import UnlockAccount from './components/UnlockAccount';
import { getAccountLockState } from '@/services/account';
import CheckOutSingle from './components/CheckOutSingle';
const { confirm } = Modal;

const AccountPanel = props => {
  const [accountOp, setAccountOp] = useState(true);
  const [accountCategory, setAccountCategory] = useState('settle');
  const [audit, setAudit] = useState(null);

  useEffect(() => {
    setAccountOp(true);

    getAuditDate().then(rsp => {
      if (rsp && rsp.code == Constants.SUCCESS) {
        const data = rsp.data || [];
        if (data[0] && data[0].audit_date) {
          setAudit(data[0].audit_date);
        }
      }
    });

    if (
      props.orderInfo.status == 'I' ||
      props.orderInfo.status == 'R' ||
      props.orderInfo.status == 'RG'
    ) {
      if (props.orderInfo.status != 'I') {
        setSettleDis(true);
        setCheckOutDis(true);
        // setSettleJoinDis(true);
      } else {
        setSettleDis(false);
        setCheckOutDis(false);
        // setSettleJoinDis(false);
      }
      setSettlePartDis(false);
      setTransferDis(false);
      setEntryDis(false);
      setPayDis(false);
      setOnAccoutDis(false);
      setReverseDis(false);
      setCancelDis(false);
      setGoodsDis(false);
      setOnSAccoutDis(false);
      setPrintDis(false);
      setUnlockDis(true);
    } else {
      setSettleDis(true);
      // setSettleJoinDis(true);
      setSettlePartDis(true);
      setCheckOutDis(true);
      setTransferDis(true);
      setEntryDis(true);
      setPayDis(true);
      setOnAccoutDis(true);
      setReverseDis(true);
      setCancelDis(true);
      setGoodsDis(true);
      setOnSAccoutDis(true);
      setPrintDis(true);

      if (props.authRouters) {
        const auths = props.authRouters.filter(
          item => item.right_type == '3' && item.right_name == '????????????',
        );
        if (auths && auths.length > 0) {
          setUnlockDis(false);
        } else {
          setUnlockDis(true);
        }
      } else {
        setUnlockDis(true);
      }

      accountLockInit();
    }
  }, [props.collapseInit, props.authRouters]);

  useEffect(() => {
    if (
      props.orderInfo.status == 'I' ||
      props.orderInfo.status == 'R' ||
      props.orderInfo.status == 'RG'
    ) {
      if (props.orderInfo.status != 'I') {
        setSettleJoinDis(true);
        setMainRoomDis(true);
      } else {
        if (props.isJoin && props.isMain) {
          setSettleJoinDis(false);
        } else {
          setSettleJoinDis(true);
        }
        if (props.isJoin && !props.isMain) {
          setMainRoomDis(false);
        } else {
          setMainRoomDis(true);
        }
      }
    } else {
      setSettleJoinDis(true);
      setMainRoomDis(true);
    }
  }, [props.isJoin, props.isMain]);

  const accountLockInit = () => {
    getAccountLockState(props.orderInfo.id).then(rsp => {
      if (rsp && rsp.code == Constants.SUCCESS) {
        const list = rsp.data || [];
        if (list.length > 0) {
          setSettlePartDis(false);
          setTransferDis(false);
          setEntryDis(false);
          setPayDis(false);
          setOnAccoutDis(false);
          setReverseDis(false);
          setCancelDis(false);
          setGoodsDis(false);
          setOnSAccoutDis(false);
          setPrintDis(false);
        }
      }
    });
  };

  const [settleDis, setSettleDis] = useState(true); // ?????????
  const [settleJoinDis, setSettleJoinDis] = useState(true); // ?????????
  const [settlePartDis, setSettlePartDis] = useState(true); // ????????????
  const [checkOutDis, setCheckOutDis] = useState(true); // ??????
  const [transferDis, setTransferDis] = useState(true); // ??????
  const [entryDis, setEntryDis] = useState(true); // ??????
  const [payDis, setPayDis] = useState(true); // ??????
  const [onAccoutDis, setOnAccoutDis] = useState(true); // ???AR???
  const [reverseDis, setReverseDis] = useState(true); // ??????
  const [cancelDis, setCancelDis] = useState(true); // ????????????
  const [goodsDis, setGoodsDis] = useState(true); // ?????????
  const [onSAccoutDis, setOnSAccoutDis] = useState(true); //???S???
  const [printDis, setPrintDis] = useState(true); //??????
  const [unlockDis, setUnlockDis] = useState(true); //??????
  const [mainRoomDis, setMainRoomDis] = useState(true); //????????????

  const handleCancle = () => {
    setAccountOp(true);
    props.handleClearSelect();
  };

  const handlePrint = () => {
    let currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    const { hotel_group_id, hotel_id, id } = currentUser;
    openPostWindow('api/report/exportReport/' + hotel_group_id + '/' + hotel_id + '/R002/' + id, {
      order_id: props.orderInfo.id,
    });

    setAccountOp(true);
    props.handleClearSelect();
  };

  const handleAccountOpClick = (op, dis) => {
    if (dis) {
      return;
    }

    if (op == 'print') {
      handlePrint();
      return;
    }

    if (op == 'cancel') {
      cancelAccount();
      return;
    }

    if (op == 'onSAccount') {
      closeSAccountSubmit();
      return;
    }

    if (op == 'settle') {
      // setOutVis(true);
      setSingleOutVis(true);
      setIsJoin(false);
      return;
    }

    if (op == 'settleJoin') {
      // setOutVis(true);
      setJoinOutVis(true);
      setIsJoin(true);
      return;
    }

    if (op == 'checkOut') {
      adjustCheckOutSubmit();
      return;
    }

    if (op == 'unlock') {
      unlock();
      return;
    }

    if (op == 'mainRoom') {
      handleSetMainRoom();
      return;
    }

    setAccountOp(false);
    setAccountCategory(op);
  };

  const cancelAccount = () => {
    const closeNos = props.selectAccountCloseNo;

    if (!closeNos || closeNos.length < 1 || !closeNos[0]) {
      message.info('???????????????????????????');
      return;
    }

    let hasNoOp = false;
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    const { shift, id } = currentUser;
    props.selectAccounts.map(item => {
      if (item.audit_date != audit || item.work_shift != shift || item.operate_user != id) {
        hasNoOp = true;
      }
    });

    if (hasNoOp) {
      message.info('??????????????????????????????????????????????????????,????????????');
      return;
    }

    confirm({
      title: '?????????????',
      content: '???????????????????????????' + closeNos.toString() + '??????????',
      okText: '??????',
      cancelText: '??????',
      onOk() {
        const { dispatch } = props;
        if (dispatch) {
          dispatch({
            type: 'global/changeLoading',
            payload: true,
          });

          let accounts = [];
          closeNos.map(item => {
            accounts.push({
              close_account_no: item,
            });
          });
          cancelSettle({ accounts }).then(rsp => {
            dispatch({
              type: 'global/changeLoading',
              payload: false,
            });
            if (rsp && rsp.code == Constants.SUCCESS) {
              message.success(rsp.message);
            }
          });
        }
      },
    });
  };

  const closeSAccountSubmit = () => {
    // ???????????? 1-?????????2-?????????3-?????????4-?????????5-?????????6-???S???'
    const selectAccounts = props.selectAccounts || [];

    if (selectAccounts.length < 1) {
      message.error('???????????????????????????');
      return;
    }

    const hasDis = selectAccounts.some(item => item.status != '1');
    if (hasDis) {
      message.error('???????????????S?????????');
      return;
    }

    confirm({
      title: '???S????',
      content: '????????????????????????S????',
      okText: '??????',
      cancelText: '??????',
      onOk() {
        const { dispatch } = props;
        if (dispatch) {
          dispatch({
            type: 'global/changeLoading',
            payload: true,
          });

          const selectAccountIds = props.selectAccountIds;
          closeSAccount(selectAccountIds).then(rsp => {
            dispatch({
              type: 'global/changeLoading',
              payload: false,
            });
            if (rsp && rsp.code == Constants.SUCCESS) {
              message.success(rsp.message);
            }
          });
        }
      },
    });
  };

  // const [outVis, setOutVis] = useState(false);
  const [outConfirmVis, setOutConfirmVis] = useState(false);
  const [orders, setOrders] = useState([]);
  const [isJoin, setIsJoin] = useState(false);

  const [singleOutVis, setSingleOutVis] = useState(false);
  const [joinOutVis, setJoinOutVis] = useState(false);

  const [unlockVis, setUnlockVis] = useState(false);

  // ???????????????????????????????????????
  const [adjustOutVis, setAdjustOutVis] = useState(false);

  const handleCheckout = (checkout, orders) => {
    // setOutVis(false);
    setSingleOutVis(false);
    setJoinOutVis(false);
    if (checkout) {
      confirm({
        title: '???????',
        content: '?????????????',
        okText: '??????',
        cancelText: '??????',
        onOk() {
          if (isJoin) {
            setOutConfirmVis(true);
            setOrders(orders || []);
          } else {
            const { dispatch } = props;
            if (dispatch) {
              dispatch({
                type: 'global/changeLoading',
                payload: true,
              });
              checkOut(props.orderInfo.id).then(rsp => {
                dispatch({
                  type: 'global/changeLoading',
                  payload: false,
                });
                if (rsp && rsp.code == Constants.SUCCESS) {
                  message.success(rsp.message);
                }
              });
            }
          }
        },
      });
    }
  };

  // ?????????????????????
  const adjustCheckOutSubmit = () => {
    setAdjustOutVis(true);
  };

  const unlock = () => {
    setUnlockVis(true);
  };

  // ????????????
  const handleSetMainRoom = () => {
    confirm({
      title: '?????????????',
      content: '????????????' + props.orderInfo.room_no + '????????????????',
      okText: '??????',
      cancelText: '??????',
      onOk() {
        const { dispatch } = props;
        if (dispatch) {
          dispatch({
            type: 'global/changeLoading',
            payload: true,
          });
          setMainOrderRoom(props.orderInfo.id).then(rsp => {
            dispatch({
              type: 'global/changeLoading',
              payload: false,
            });
            if (rsp && rsp.code == Constants.SUCCESS) {
              message.success(rsp.message);
            }
          });
        }
      },
    });
  };

  const { orderInfo } = props;

  return (
    <>
      {accountOp && (
        <>
          <Row type="flex" gutter={[16, 16]}>
            <Col
              span={12}
              className={
                settleDis ? classNames(styles.opContain, styles.disable) : styles.opContain
              }
              onClick={() => handleAccountOpClick('settle', settleDis)}
            >
              <span>??????&ensp;(???)</span>
              <span>
                <img src={settleDis ? lyDisSvg : lySvg} alt="" />
              </span>
            </Col>
            <Col
              span={12}
              className={
                settleJoinDis ? classNames(styles.opContain, styles.disable) : styles.opContain
              }
              onClick={() => handleAccountOpClick('settleJoin', settleJoinDis)}
            >
              <span>??????&ensp;(???)</span>
              <span>
                <img src={settleJoinDis ? lyDisSvg : lySvg} alt="" />
              </span>
            </Col>
            <Col
              span={12}
              className={
                settlePartDis ? classNames(styles.opContain, styles.disable) : styles.opContain
              }
              onClick={() => handleAccountOpClick('settlePart', settlePartDis)}
            >
              <span>????????????</span>
              <span>
                <img src={settlePartDis ? lyDisSvg : lySvg} alt="" />
              </span>
            </Col>
            <Col
              span={12}
              className={
                checkOutDis ? classNames(styles.opContain, styles.disable) : styles.opContain
              }
              onClick={() => handleAccountOpClick('checkOut', checkOutDis)}
            >
              <span>???&emsp;&emsp;???</span>
              <span>
                <img src={checkOutDis ? lyDisSvg : lySvg} alt="" />
              </span>
            </Col>
            <Col
              span={12}
              className={
                transferDis ? classNames(styles.opContain, styles.disable) : styles.opContain
              }
              onClick={() => handleAccountOpClick('transfer', transferDis)}
            >
              <span>???&emsp;&emsp;???</span>
              <span>
                <img src={transferDis ? lyDisSvg : lySvg} alt="" />
              </span>
            </Col>
            <Col
              span={12}
              className={entryDis ? classNames(styles.opContain, styles.disable) : styles.opContain}
              onClick={() => handleAccountOpClick('entry', entryDis)}
            >
              <span>???&emsp;&emsp;???</span>
              <span>
                <img src={entryDis ? lyDisSvg : lySvg} alt="" />
              </span>
            </Col>
            <Col
              span={12}
              className={payDis ? classNames(styles.opContain, styles.disable) : styles.opContain}
              onClick={() => handleAccountOpClick('pay', payDis)}
            >
              <span>???&emsp;&emsp;???</span>
              <span>
                <img src={payDis ? lyDisSvg : lySvg} alt="" />
              </span>
            </Col>
            <Col
              span={12}
              className={
                onAccoutDis ? classNames(styles.opContain, styles.disable) : styles.opContain
              }
              onClick={() => handleAccountOpClick('onAccount', onAccoutDis)}
            >
              <span>???&ensp;AR&ensp;???</span>
              <span>
                <img src={onAccoutDis ? lyDisSvg : lySvg} alt="" />
              </span>
            </Col>
            <Col
              span={12}
              className={
                reverseDis ? classNames(styles.opContain, styles.disable) : styles.opContain
              }
              onClick={() => handleAccountOpClick('reverse', reverseDis)}
            >
              <span>???&emsp;&emsp;???</span>
              <span>
                <img src={reverseDis ? lyDisSvg : lySvg} alt="" />
              </span>
            </Col>
            <Col
              span={12}
              className={
                cancelDis ? classNames(styles.opContain, styles.disable) : styles.opContain
              }
              onClick={() => handleAccountOpClick('cancel', cancelDis)}
            >
              <span>????????????</span>
              <span>
                <img src={cancelDis ? lyDisSvg : lySvg} alt="" />
              </span>
            </Col>
            <Col
              span={12}
              className={goodsDis ? classNames(styles.opContain, styles.disable) : styles.opContain}
              onClick={() => handleAccountOpClick('goods', goodsDis)}
            >
              <span>???&ensp;???&ensp;???</span>
              <span>
                <img src={goodsDis ? lyDisSvg : lySvg} alt="" />
              </span>
            </Col>
            <Col
              span={12}
              className={
                onSAccoutDis ? classNames(styles.opContain, styles.disable) : styles.opContain
              }
              onClick={() => handleAccountOpClick('onSAccount', onSAccoutDis)}
            >
              <span>???&ensp;S&ensp;???</span>
              <span>
                <img src={onSAccoutDis ? lyDisSvg : lySvg} alt="" />
              </span>
            </Col>
            <Col
              span={12}
              className={printDis ? classNames(styles.opContain, styles.disable) : styles.opContain}
              onClick={() => handleAccountOpClick('print', printDis)}
            >
              <span>???&emsp;&emsp;???</span>
              <span>
                <img src={printDis ? lyDisSvg : lySvg} alt="" />
              </span>
            </Col>
            <Col
              span={12}
              className={
                unlockDis ? classNames(styles.opContain, styles.disable) : styles.opContain
              }
              onClick={() => handleAccountOpClick('unlock', unlockDis)}
            >
              <span>???&emsp;&emsp;???</span>
              <span>
                <img src={unlockDis ? lyDisSvg : lySvg} alt="" />
              </span>
            </Col>
            <Col
              span={12}
              className={
                mainRoomDis ? classNames(styles.opContain, styles.disable) : styles.opContain
              }
              onClick={() => handleAccountOpClick('mainRoom', mainRoomDis)}
            >
              <span>????????????</span>
              <span>
                <img src={mainRoomDis ? lyDisSvg : lySvg} alt="" />
              </span>
            </Col>
          </Row>
        </>
      )}

      {/* {!accountOp && accountCategory == 'settle' && (
        <Settle
          {...props.orderInfo}
          selectAccountIds={props.selectAccountIds}
          selectAccountCharge={props.selectAccountCharge}
          selectAccounts={props.selectAccounts}
          handleCancle={handleCancle}
        />
      )} */}
      {/* {!accountOp && accountCategory == 'settleJoin' && (
        <SettleJoin
          {...props.orderInfo}
          selectAccountIds={props.selectAccountIds}
          selectAccountCharge={props.selectAccountCharge}
          selectAccounts={props.selectAccounts}
          handleCancle={handleCancle}
        />
      )} */}
      {!accountOp && accountCategory == 'settlePart' && (
        <SettlePart
          {...props.orderInfo}
          selectAccountIds={props.selectAccountIds}
          selectAccountCharge={props.selectAccountCharge}
          selectAccounts={props.selectAccounts}
          handleCancle={handleCancle}
        />
      )}
      {/* {!accountOp && accountCategory == 'checkOut' && <CheckOut handleCancle={handleCancle} />} */}
      {!accountOp && accountCategory == 'transfer' && (
        <Transfer
          orderInfo={orderInfo}
          selectAccountIds={props.selectAccountIds}
          selectAccounts={props.selectAccounts}
          handleCancle={handleCancle}
        />
      )}
      {!accountOp && accountCategory == 'entry' && (
        <Entry {...props.orderInfo} handleCancle={handleCancle} />
      )}
      {!accountOp && accountCategory == 'pay' && (
        <Pay {...props.orderInfo} handleCancle={handleCancle} />
      )}
      {!accountOp && accountCategory == 'onAccount' && (
        <OnAccount
          {...props.orderInfo}
          selectAccountIds={props.selectAccountIds}
          selectAccountCharge={props.selectAccountCharge}
          selectAccounts={props.selectAccounts}
          handleCancle={handleCancle}
        />
      )}
      {!accountOp && accountCategory == 'reverse' && (
        <Reverse
          {...props.orderInfo}
          selectAccountIds={props.selectAccountIds}
          selectAccountCharge={props.selectAccountCharge}
          selectAccounts={props.selectAccounts}
          handleCancle={handleCancle}
          audit={audit}
        />
      )}
      {!accountOp && accountCategory == 'goods' && (
        <Goods {...props.orderInfo} handleCancle={handleCancle} />
      )}
      {!accountOp && accountCategory == 'onSAccount' && (
        <OnSAccount
          {...props.orderInfo}
          selectAccountIds={props.selectAccountIds}
          selectAccountCharge={props.selectAccountCharge}
          selectAccounts={props.selectAccounts}
          handleCancle={handleCancle}
        />
      )}

      <CheckOutSingle
        orderInfo={props.orderInfo}
        isJoin={isJoin}
        visible={singleOutVis}
        handleCancel={(checkout, orders) => handleCheckout(checkout, orders)}
      />

      <CheckOutJoin
        orderInfo={props.orderInfo}
        isJoin={isJoin}
        visible={joinOutVis}
        handleCancel={(checkout, orders) => handleCheckout(checkout, orders)}
      />

      <CheckOutConfirm
        visible={outConfirmVis}
        orders={orders}
        handleCancel={() => setOutConfirmVis(false)}
      />

      <CheckOut
        orderInfo={props.orderInfo}
        visible={adjustOutVis}
        handleCancel={() => setAdjustOutVis(false)}
      />

      <UnlockAccount
        visible={unlockVis}
        orderInfo={props.orderInfo}
        handleCancel={() => setUnlockVis(false)}
      />
    </>
  );
};

export default connect(({ global, menu }) => ({
  loading: global.loading,
  authRouters: menu.authRouters,
}))(AccountPanel);
