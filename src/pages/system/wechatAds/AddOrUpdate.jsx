import {
  Modal,
  Row,
  Col,
  Input,
  Form,
  InputNumber,
  message,
  Upload,
  Button,
  Icon,
  DatePicker,
} from 'antd';
import { useEffect, useState } from 'react';
import Constants from '@/constans';
import moment from 'moment';
import { addWechatAds, updateWechatAds } from '@/services/global';

const AddOrUpdate = props => {
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
          id,
          url,
          description,
          href,
          validity_start,
          validity_end,
          sort_no,
          memo,
        } = props.formValues;
        if (url) {
          setFileList([{ uid: -1, id, url }]);
        } else {
          setFileList([]);
        }
        props.form.setFieldsValue({
          url,
          description,
          href,
          validity_start: validity_start && moment(validity_start),
          validity_end: validity_end && moment(validity_end),
          sort_no,
          memo,
        });
      } else {
        props.form.resetFields();
        setFileList([]);
      }
    }
  }, [props.visible]);

  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);
  const [previewVis, setPreviewVis] = useState(false);

  const handleSubmit = () => {
    props.form.validateFields((err, fieldsValue) => {
      if (err == null) {
        fieldsValue.validity_start =
          fieldsValue.validity_start && fieldsValue.validity_start.format('YYYY-MM-DD HH:mm:ss');
        fieldsValue.validity_end =
          fieldsValue.validity_end && fieldsValue.validity_end.format('YYYY-MM-DD HH:mm:ss');

        let currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
        const { hotel_group_id, hotel_id, id: create_user } = currentUser;
        const modify_user = create_user;
        if (props.isAdd) {
          setLoading(true);
          addWechatAds({ ...fieldsValue, hotel_group_id, hotel_id, create_user, modify_user }).then(
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
          updateWechatAds({ ...fieldsValue, id: props.formValues.id, modify_user }).then(rsp => {
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

  const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
  const token = sessionStorage.getItem('token');

  const url =
    '/api/common/uploadFile?user_id=' +
    currentUser.id +
    '&token=' +
    token +
    '&filePath=/hotel/' +
    currentUser.hotel_group_id +
    '/';

  const handlePreview = async file => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }

    setPreviewImage(file.url || file.preview);
    setPreviewVis(true);
  };

  const uploadProps = {
    action: url,
    listType: 'picture-card',
    fileList: fileList,
    onRemove(file) {
      props.form.setFieldsValue({ url: null });
      setFileList([]);
    },
    onPreview: handlePreview,
    onChange(info) {
      if (info.fileList) {
        const list = [...info.fileList];
        if (list.length > 0) {
          const file = list[list.length - 1];
          setFileList([file]);
          if (file.status === 'done') {
            const url = file.response && file.response.data && file.response.data[0];
            props.form.setFieldsValue({ url });
          }
        } else {
          setFileList([]);
        }
      }
    },
  };

  return (
    <Modal
      title="?????????????????????"
      visible={props.visible}
      onCancel={() => props.handleCancel()}
      onOk={handleSubmit}
      confirmLoading={loading}
      width={800}
    >
      <Form {...formItemLayout}>
        <Row gutter={8} type="flex">
          <Col span={12}>
            <Form.Item label="????????????">
              {getFieldDecorator('url', {
                rules: [{ required: true, message: '????????????' }],
              })(<Input placeholder="????????????????????????????????????" />)}
            </Form.Item>
          </Col>
          <Col span={8} offset={4}>
            <Upload {...uploadProps}>
              <div>
                <Icon type="plus" />
                <div className="ant-upload-text">????????????</div>
              </div>
            </Upload>
            <Modal
              visible={previewVis}
              width={900}
              footer={null}
              onCancel={() => setPreviewVis(false)}
            >
              <img alt="example" style={{ width: '100%' }} src={previewImage} />
            </Modal>
          </Col>
          <Col span={12}>
            <Form.Item label="??????">
              {getFieldDecorator('description', {})(<Input placeholder="??????" />)}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="??????">
              {getFieldDecorator('href', {})(<Input placeholder="??????" />)}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="????????????">
              {getFieldDecorator(
                'validity_start',
                {},
              )(<DatePicker showTime format="YYYY-MM-DD HH:mm:ss" />)}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="????????????">
              {getFieldDecorator(
                'validity_end',
                {},
              )(<DatePicker showTime format="YYYY-MM-DD HH:mm:ss" />)}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="??????">{getFieldDecorator('sort_no', {})(<InputNumber />)}</Form.Item>
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

export default Form.create()(AddOrUpdate);
