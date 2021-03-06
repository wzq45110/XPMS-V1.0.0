import { Modal, Form, Select, Input, Row, Col, InputNumber } from 'antd';
import { useEffect } from 'react';
import { getGoodsType, updateGoods } from '@/services/goods';
import { useState } from 'react';
import Constans from '@/constans';
const { Option } = Select;

const UpdateGoods = props => {
  const [goodsType, setGoodsType] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getGoodsType().then(rsp => {
      if (rsp && rsp.code == Constans.SUCCESS) {
        const data = rsp.data || [];
        setGoodsType(data);
      }
    });

    console.log(props);

    const {
      form: { setFieldsValue },
    } = props;
    const { goods } = props;
    setFieldsValue({
      type_id: goods && goods.goods_type_id,
      name: goods && goods.goods_info_name,
      short_name: goods && goods.goods_short_name,
      price: goods && goods.price,
      memo: goods && goods.memo,
    });
  }, [props.goods]);

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
      sm: { span: 14, offset: -2 },
    },
  };

  const updateGoodsSubmit = () => {
    props.form.validateFields((err, values) => {
      if (!err) {
        console.log(values);

        let currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
        const goods = [
          {
            hotel_group_id: currentUser.hotel_group_id,
            hotel_id: currentUser.hotel_id,
            type_id: values.type_id,
            name: values.name,
            short_name: values.short_name,
            price: values.price,
            memo: values.memo,
            id: props.goods && props.goods.goods_info_id,
            create_user: currentUser.id,
            modify_user: currentUser.id,
          },
        ];
        console.log(goods);

        setLoading(true);
        updateGoods(goods).then(rsp => {
          setLoading(false);
          if (rsp && rsp.code == Constans.SUCCESS) {
            props.cancelUpdateGoods(true);
          }
        });
      }
    });
  };

  return (
    <Modal
      visible={props.visible}
      title="????????????"
      onCancel={props.cancelUpdateGoods}
      onOk={updateGoodsSubmit}
      confirmLoading={loading}
    >
      <Form {...formItemLayout}>
        <Row type="flex">
          <Col span={12}>
            <Form.Item label="????????????">
              {getFieldDecorator('type_id', {
                rules: [{ required: true, message: '?????????????????????' }],
              })(
                <Select>
                  {goodsType.map(item => (
                    <Option key={item.id} value={item.id}>
                      {item.type_desc}
                    </Option>
                  ))}
                </Select>,
              )}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="????????????">
              {getFieldDecorator('name', {
                rules: [{ required: true, message: '????????????' }],
                initiaValue: props.goods_info_name,
              })(<Input placeholder="????????????" />)}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="????????????">
              {getFieldDecorator('short_name', {
                initiaValue: props.goods_short_name,
              })(<Input placeholder="????????????" />)}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="????????????">
              {getFieldDecorator('price', {
                rules: [{ required: true, message: '????????????' }],
                initiaValue: props.price,
              })(<InputNumber placeholder="????????????" min={0} style={{ width: '100%' }} />)}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="????????????">
              {getFieldDecorator('memo', { initiaValue: props.memo })(
                <Input placeholder="????????????" />,
              )}
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default Form.create()(UpdateGoods);
