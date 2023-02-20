/*
 * @Author       : zizhan77
 * @Date         : 2023-01-18 23:56:47
 * @LastEditors  : Please set LastEditors
 * @LastEditTime : 2023-02-17 14:17:21
 * @FilePath     : /b2b_web/src/components/Builder/ModalForm/index.tsx
 */
import React, { useState, useEffect } from 'react'

import styles from './index.less';
import BraftEditor from 'braft-editor';
// import 'braft-editor/dist/index.css';
import moment from 'moment';
import 'moment/locale/zh-cn';
moment.locale('zh-cn');
import locale from 'antd/lib/date-picker/locale/zh_CN';
import Language from '../language';
import { imgUrl } from "@/common/constant";

import { Map, Marker } from 'react-amap';
import Autocomplete from 'react-amap-plugin-autocomplete';

import { getList, saveData, deleteData, getCreateFormData, getEditFormData } from '../BasicServe/idnex'

import {
    Card,
    Spin,
    InputNumber,
    DatePicker,
    Tabs,
    Switch,
    TreeSelect,
    Tag,
    Form,
    Select,
    Input,
    Button,
    Checkbox,
    Radio,
    Upload,
    message,
    Modal,
    Tree,
    Cascader
} from 'antd';
import form from 'antd/lib/form';

// import { formData } from "../testData/formData"

const { TextArea } = Input;
const TabPane = Tabs.TabPane;
const Option = Select.Option;
const RadioGroup = Radio.Group;
const { RangePicker } = DatePicker;
const { TreeNode } = Tree;

moment.locale('zh-cn');

interface props {
    url: any,
    editData: any
    formData: any
    close: (e: any) => void
}
const ModalForm: React.FC<props> = ({ url, editData, formData, close }) => {
    const [pageLoading, setpageLoading] = useState(false)
    //表单配置项
    const [controls, setControls] = useState<any>([])
    const [labelCol, setLabelCol] = useState<any>({})
    const [wrapperCol, setWrapperCol] = useState<any>({})
    const [previewImage, setPreviewImage] = useState<any>("")
    const [previewVisible, setpreviewVisible] = useState<any>(false)
    const [form] = Form.useForm(); //普通搜索
    // 头像展示
    const [avatarUrl, setAvatarUrl] = useState<any>("")

    useEffect(() => {
        // form.setFieldsValue({ ...editData })
    }, [editData])
    // 获取数据
    useEffect(() => {
        getInitData()
    }, [formData])
    // 获取数据方法
    const getInitData = () => {

        const { controls, labelCol, wrapperCol } = formData
        controls.map((res:any) => {
            if (res.componentName == 'image' && res.mode != "multiple"){
                setAvatarUrl(res.value)
            }
        })
        setControls(controls)
        setLabelCol(labelCol)
        setWrapperCol(wrapperCol)
    }
    const callback = (name: any, value: any, url: any) => {

        if (name == 'submit') {
            onSubmit(url);
        }
        if (name == 'reset') {
            form.resetFields();
        }
    };

    const onSubmit = (getUrl: string) => {

        form.validateFields().then((values) => {
            saveData(getUrl, values).then(res => {
                if (res.code == 200) {
                    message.success(res.msg)
                    close(2)
                    form.resetFields();
                } else {
                    message.error(res.msg)
                }
            })
        })
    };

    const handleEditorUpload = (param: any) => {
        const serverURL = '/api/admin/picture/upload';
        const xhr = new XMLHttpRequest();
        const fd = new FormData();

        const successFn = (response: any) => {
            // 假设服务端直接返回文件上传后的地址
            // 上传成功后调用param.success并传入上传后的文件地址

            const responseObj = JSON.parse(xhr.responseText);

            if (responseObj.status === 'success') {
                param.success({
                    url: responseObj.data.url,
                    meta: {
                        id: responseObj.data.id,
                        title: responseObj.data.title,
                        alt: responseObj.data.title,
                        loop: true, // 指定音视频是否循环播放
                        autoPlay: true, // 指定音视频是否自动播放
                        controls: true, // 指定音视频是否显示控制栏
                        poster: responseObj.data.url, // 指定视频播放器的封面
                    },
                });
            } else {
                // 上传发生错误时调用param.error
                param.error({
                    msg: responseObj.msg,
                });
            }
        };

        const progressFn = (event: any) => {
            // 上传进度发生变化时调用param.progress
            param.progress((event.loaded / event.total) * 100);
        };

        const errorFn = (response: any) => {
            // 上传发生错误时调用param.error
            param.error({
                msg: 'unable to upload.',
            });
        };

        xhr.upload.addEventListener('progress', progressFn, false);
        xhr.addEventListener('load', successFn, false);
        xhr.addEventListener('error', errorFn, false);
        xhr.addEventListener('abort', errorFn, false);

        fd.append('file', param.file);
        xhr.open('POST', serverURL, true);
        xhr.setRequestHeader('Authorization', 'Bearer ' + sessionStorage['token']);
        xhr.send(fd);
    };

    const handleCancel = () => {
        setpreviewVisible(false)
    };

    const closeModal = () => {
        // dispatch({
        //   type: 'list/modalVisible',
        //   payload: {
        //     modalVisible: false,
        //     modalFormUrl:'',
        //     modalTitle:'',
        //     modalWidth:'',
        //     modalHeight:'',
        //   }
        // });
    };

    const reset = () => {
        // form.resetFields();
    };

    const renderTreeNodes = (data: any[]) =>

        data.map(item => {
            if (item.children) {
                return (
                    <TreeNode title={item.title} key={item.key} dataRef={item} >
                        {renderTreeNodes(item.children)}
                    </TreeNode>
                );
            }
            return <TreeNode {...item} />;
        });

    return (
        <Spin spinning={pageLoading} tip="Loading..." style={{ background: '#fff' }}>
            <Form style={{ marginTop: 15 }} form={form} >
                {!!controls &&
                    controls.map((control: any) => {

                        if (control.componentName == "id") {
                            return (
                                <Form.Item
                                    style={{ 'display': control.display }}
                                    labelCol={control.labelCol ? control.labelCol : labelCol}
                                    wrapperCol={control.wrapperCol ? control.wrapperCol : wrapperCol}
                                    label={control.labelName}
                                    extra={control.extra}
                                    name={control.name}
                                    rules={[control.rules]}
                                    initialValue={control.value}

                                >
                                    <Input size={control.size} style={control.style} placeholder={control.placeholder} />
                                </Form.Item>
                            );
                        }

                        if (control.componentName == "text") {
                            return (
                                <Form.Item
                                    labelCol={control.labelCol ? control.labelCol : labelCol}
                                    wrapperCol={control.wrapperCol ? control.wrapperCol : wrapperCol}
                                    label={control.labelName}
                                    extra={control.extra}
                                    name={control.name}
                                    rules={[control.rules]}
                                    initialValue={control.value}

                                >
                                    <span style={control.style}>{control.value}</span>
                                </Form.Item>
                            );
                        }

                        if (control.componentName == "input") {
                            return (
                                <Form.Item
                                    labelCol={control.labelCol ? control.labelCol : labelCol}
                                    wrapperCol={control.wrapperCol ? control.wrapperCol : wrapperCol}
                                    label={control.labelName}
                                    extra={control.extra}
                                    name={control.name}
                                    rules={[control.rules]}
                                    initialValue={control.value}
                                >
                                    <Input size={control.size} type={control.type} style={control.style} placeholder={control.placeholder} />
                                </Form.Item>
                            );
                        }
                        if (control.componentName == "language") {
                            return (
                                <Form.Item
                                    labelCol={control.labelCol ? control.labelCol : labelCol}
                                    wrapperCol={control.wrapperCol ? control.wrapperCol : wrapperCol}
                                    label={control.labelName}
                                    extra={control.extra}
                                    name={control.name}
                                    rules={[control.rules]}
                                    initialValue={control.value}
                                >
                                    <Language item={control} value={control.value} />
                                </Form.Item>
                            );
                        }
                        if (control.componentName == "textArea") {
                            return (
                                <Form.Item
                                    labelCol={control.labelCol ? control.labelCol : labelCol}
                                    wrapperCol={control.wrapperCol ? control.wrapperCol : wrapperCol}
                                    label={control.labelName}
                                    extra={control.extra}
                                    name={control.name}
                                    rules={[control.rules]}
                                    initialValue={control.value}
                                >
                                    <TextArea style={control.style} autoSize={control.autosize} rows={control.rows} placeholder={control.placeholder} />
                                </Form.Item>
                            );
                        }

                        if (control.componentName == "inputNumber") {
                            return (
                                <Form.Item
                                    labelCol={control.labelCol ? control.labelCol : labelCol}
                                    wrapperCol={control.wrapperCol ? control.wrapperCol : wrapperCol}
                                    label={control.labelName}
                                    extra={control.extra}
                                    name={control.name}
                                    rules={[control.rules]}
                                    initialValue={control.value}
                                >
                                    <InputNumber size={control.size} style={control.style} max={control.max} min={control.min} step={control.step} placeholder={control.placeholder} />
                                </Form.Item>
                            );
                        }

                        if (control.componentName == "checkbox") {
                            return (
                                <Form.Item
                                    labelCol={control.labelCol ? control.labelCol : labelCol}
                                    wrapperCol={control.wrapperCol ? control.wrapperCol : wrapperCol}
                                    label={control.labelName}
                                    extra={control.extra}
                                    name={control.name}
                                    rules={[control.rules]}
                                    initialValue={control.value}
                                >
                                    <Checkbox.Group style={control.style}>
                                        {!!control.list && control.list.map((value: any) => {
                                            return (<Checkbox value={value.value}>{value.name}</Checkbox>)
                                        })}
                                    </Checkbox.Group>
                                </Form.Item>
                            );
                        }

                        if (control.componentName == "radio") {
                            return (
                                <Form.Item
                                    labelCol={control.labelCol ? control.labelCol : labelCol}
                                    wrapperCol={control.wrapperCol ? control.wrapperCol : wrapperCol}
                                    label={control.labelName}
                                    extra={control.extra}
                                    name={control.name}
                                    rules={[control.rules]}
                                    initialValue={control.value}
                                >
                                    <RadioGroup size={control.size} style={control.style}>
                                        {!!control.list && control.list.map((value: any) => {
                                            return (<Radio value={value.value}>{value.name}</Radio>)
                                        })}
                                    </RadioGroup>
                                </Form.Item>
                            );
                        }

                        if (control.componentName == "select") {
                            if (control.mode) {
                                return (
                                    <Form.Item
                                        labelCol={control.labelCol ? control.labelCol : labelCol}
                                        wrapperCol={control.wrapperCol ? control.wrapperCol : wrapperCol}
                                        label={control.labelName}
                                        extra={control.extra}
                                        name={control.name}
                                        rules={[control.rules]}
                                        initialValue={control.value}
                                    >
                                        <Select mode={control.mode} size={control.size} style={control.style} placeholder={control.placeholder}>
                                            {!!control.options && control.options.map((option: any) => {
                                                return (<Select.Option key={option.value}>{option.name}</Select.Option>)
                                            })}
                                        </Select>
                                    </Form.Item>
                                );
                            } else {
                                return (
                                    <Form.Item
                                        labelCol={control.labelCol ? control.labelCol : labelCol}
                                        wrapperCol={control.wrapperCol ? control.wrapperCol : wrapperCol}
                                        label={control.labelName}
                                        extra={control.extra}
                                        name={control.name}
                                        rules={[control.rules]}
                                        initialValue={control.value}
                                    >
                                        <Select mode={control.mode} size={control.size} style={control.style} placeholder={control.placeholder}>
                                            {!!control.options && control.options.map((option: any) => {
                                                return (<Select.Option key={option.value}>{option.name}</Select.Option>)
                                            })}
                                        </Select>
                                    </Form.Item>
                                );
                            }
                        }

                        if (control.componentName == "icon") {
                            return (
                                <Form.Item
                                    labelCol={control.labelCol ? control.labelCol : labelCol}
                                    wrapperCol={control.wrapperCol ? control.wrapperCol : wrapperCol}
                                    label={control.labelName}
                                    extra={control.extra}
                                    name={control.name}
                                    rules={[control.rules]}
                                    initialValue={control.value}
                                >
                                    <Select size={control.size} style={control.style} placeholder={control.placeholder}>
                                        {!!control.options && control.options.map((option: any) => {
                                            return (<Select.Option key={option}>
                                                {/* <Icon type={option} /> */}
                                                {option}</Select.Option>)
                                        })}
                                    </Select>
                                </Form.Item>
                            );
                        }

                        if (control.componentName == "switch") {
                            return (
                                <Form.Item
                                    labelCol={control.labelCol ? control.labelCol : labelCol}
                                    wrapperCol={control.wrapperCol ? control.wrapperCol : wrapperCol}
                                    label={control.labelName}
                                    extra={control.extra}
                                    name={control.name}
                                    rules={[control.rules]}
                                    initialValue={control.value}
                                >
                                    <Switch style={control.style} checkedChildren={control.checkedChildren} unCheckedChildren={control.unCheckedChildren} />
                                </Form.Item>
                            );
                        }

                        if (control.componentName == "datePicker") {
                            return (
                                <Form.Item
                                    labelCol={control.labelCol ? control.labelCol : labelCol}
                                    wrapperCol={control.wrapperCol ? control.wrapperCol : wrapperCol}
                                    label={control.labelName}
                                    extra={control.extra}
                                    name={control.name}
                                    rules={[control.rules]}
                                    initialValue={control.value}
                                >
                                    <DatePicker
                                        showTime={control.showTime}
                                        size={control.size}
                                        style={control.style}
                                        locale={locale}
                                        format={control.format}
                                        placeholder={control.placeholder}
                                    />
                                </Form.Item>
                            );
                        }

                        if (control.componentName == "rangePicker") {
                            return (
                                <Form.Item
                                    labelCol={control.labelCol ? control.labelCol : labelCol}
                                    wrapperCol={control.wrapperCol ? control.wrapperCol : wrapperCol}
                                    label={control.labelName}
                                    extra={control.extra}
                                    name={control.name}
                                    rules={[control.rules]}
                                    initialValue={control.value}
                                >
                                    <RangePicker
                                        showTime={control.showTime}
                                        size={control.size}
                                        style={control.style}
                                        locale={locale}
                                        format={control.format}
                                    />
                                </Form.Item>
                            );
                        }

                        if (control.componentName == "tree") {
                            return (
                                <Form.Item
                                    labelCol={control.labelCol ? control.labelCol : labelCol}
                                    wrapperCol={control.wrapperCol ? control.wrapperCol : wrapperCol}
                                    label={control.labelName}
                                    extra={control.extra}
                                    name={control.name}
                                    rules={[control.rules]}
                                    initialValue={() => control.list.map((f: any) => {
                                        if (f.value == control.value) return f.name
                                    })}
                                >
                                    {/* <Tree
                                        checkable
                                    >
                                        {renderTreeNodes(control.list)}
                                    </Tree> */}
                                    <Select defaultValue={control.value}>
                                        {/* {
                                            control.list.map(res => {
                                                return <Select.Option>{res}</Select.Option>
                                            })
                                        } */}
                                        {!!control.list && control.list.map((option: any) => {
                                            return (<Select.Option key={option.value}>{option.name}</Select.Option>)
                                        })}
                                    </Select>
                                    {/* <TreeSelect
                                        allowClear
                                        style={{ width: '100%' }}
                                        dropdownStyle={{ maxHeight: 400, overflow: 'auto', minWidth: 300 }}
                                        placeholder='请选择销售组织'
                                        getPopupContainer={triggerNode => triggerNode.parentElement}
                                        dropdownMatchSelectWidth
                                        treeDefaultExpandAll
                                        treeData={control.list}
                                        fieldNames={{
                                            label: 'name',
                                            value: 'value',
                                            children: 'children',
                                        }}
                                    /> */}
                                </Form.Item>
                            );
                        }

                        if (control.componentName == "editor") {
                            return (
                                <Form.Item
                                    labelCol={control.labelCol ? control.labelCol : labelCol}
                                    wrapperCol={control.wrapperCol ? control.wrapperCol : wrapperCol}
                                    label={control.labelName}
                                    extra={control.extra}
                                    name={control.name}
                                    rules={[control.rules]}
                                    initialValue={control.value}
                                >
                                    <div className={styles.editor}>
                                        <BraftEditor
                                            contentStyle={control.style}
                                            media={{ uploadFn: handleEditorUpload }}
                                        />
                                    </div>
                                </Form.Item>
                            );
                        }

                        if (control.componentName == "image") {
                            // 多图片上传模式
                            if (control.mode == "multiple") {
                                let uploadButton = (
                                    <div>
                                        <Icon type="plus" />
                                        <div className="ant-upload-text">{control.button}</div>
                                    </div>
                                );
                                var getFileList = control.value;
                                return (
                                    <Form.Item
                                        labelCol={control.labelCol ? control.labelCol : labelCol}
                                        wrapperCol={control.wrapperCol ? control.wrapperCol : wrapperCol}
                                        label={control.labelName}
                                        extra={control.extra}
                                        name={control.name}
                                        rules={[control.rules]}
                                        initialValue={control.value}
                                    >
                                        <Upload
                                            name={'file'}
                                            listType={"picture-card"}
                                            fileList={getFileList}
                                            multiple={true}
                                            onPreview={(file: any) => {
                                                // dispatch({
                                                //     type: 'form/previewImage',
                                                //     payload: {
                                                //         previewImage: file.url || file.thumbUrl,
                                                //         previewVisible: true,
                                                //     }
                                                // }
                                                // )
                                            }}
                                            action={imgUrl}
                                            headers={{ authorization: 'Bearer ' + sessionStorage['token'] }}
                                            beforeUpload={(file: any) => {
                                                let canUpload = false;
                                                for (var i = 0; i < control.limitType.length; i++) {
                                                    if (control.limitType[i] == file.type) {
                                                        canUpload = true;
                                                    }
                                                }
                                                if (!canUpload) {
                                                    message.error('请上传正确格式的图片!');
                                                    return false;
                                                }
                                                const isLtSize = file.size / 1024 / 1024 < control.limitSize;
                                                if (!isLtSize) {
                                                    message.error('图片大小不可超过' + control.limitSize + 'MB!');
                                                    return false;
                                                }
                                                return true;
                                            }}
                                            onChange={(info: any) => {
                                                let fileList = info.fileList;
                                                fileList = fileList.slice(-control.limitNum);
                                                fileList = fileList.map((file: any) => {
                                                    if (file.response) {
                                                        file.url = file.response.data.url;
                                                        file.uid = file.response.data.id;
                                                        file.id = file.response.data.id;
                                                    }
                                                    return file;
                                                });

                                                fileList = fileList.filter((file: any) => {
                                                    if (file.response) {
                                                        return file.response.status === 'success';
                                                    }
                                                    return true;
                                                });

                                                // dispatch({
                                                //     type: 'form/updateFileList',
                                                //     payload: {
                                                //         fileList: fileList,
                                                //         controlName: control.name
                                                //     }
                                                // });
                                            }}
                                        >
                                            {control.value >= 3 ? null : uploadButton}
                                        </Upload>
                                        <Modal
                                            visible={previewVisible}
                                            footer={null}
                                            onCancel={handleCancel}
                                        >
                                            <img style={{ width: '100%' }} src={previewImage} />
                                        </Modal>
                                    </Form.Item>
                                );
                            } else {
                                // 单图片上传模式
                                let uploadButton = (
                                    <div>
                                        <Icon type="plus" />
                                        <div className="ant-upload-text">{control.button}</div>
                                    </div>
                                );

                                return (
                                    <Form.Item
                                        labelCol={control.labelCol ? control.labelCol : labelCol}
                                        wrapperCol={control.wrapperCol ? control.wrapperCol : wrapperCol}
                                        label={control.labelName}
                                        extra={control.extra}
                                        name={control.name}
                                        rules={[control.rules]}
                                        initialValue={control.value}
                                    >
                                        <Upload
                                            name={'file'}
                                            listType={"picture-card"}
                                            showUploadList={false}
                                            action={imgUrl}
                                            headers={{ authorization: 'Bearer ' + sessionStorage['token'] }}
                                            beforeUpload={(file: any) => {
                                                let canUpload = false;
                                                for (var i = 0; i < control.limitType.length; i++) {
                                                    if (control.limitType[i] == file.type) {
                                                        canUpload = true;
                                                    }
                                                }
                                                if (!canUpload) {
                                                    message.error('请上传正确格式的图片!');
                                                    return false;
                                                }
                                                const isLtSize = file.size / 1024 / 1024 < control.limitSize;
                                                if (!isLtSize) {
                                                    message.error('图片大小不可超过' + control.limitSize + 'MB!');
                                                    return false;
                                                }
                                                return true;
                                            }}
                                            onChange={(info: any) => {
                                                if (info.file.status === 'done') {
                                                    // Get this url from response in real world.
                                                    if (info.file.response.image_url) {
                                                        let fileList = [];

                                                        if (info.file.response.image_url) {
                                                            // info.file.url = info.file.response.image_url;
                                                            // info.file.uid = info.file.response.id;
                                                            // info.file.id = info.file.response.id;
                                                            // control.value = info.file.response.image_url
                                                            form.setFieldValue(control.name, info.file.response.image_url)
                                                            setAvatarUrl(info.file.response.image_url)
                                                        }

                                                        fileList[0] = info.file;
                                                        // dispatch({
                                                        //     type: 'form/updateFileList',
                                                        //     payload: {
                                                        //         fileList: fileList,
                                                        //         controlName: control.name
                                                        //     }
                                                        // });
                                                    } else {
                                                        message.error('上传失败');
                                                    }
                                                }
                                            }}
                                        >
                                            {avatarUrl ? (
                                                <img src={avatarUrl} alt="avatar" width={80} />
                                            ) : (uploadButton)}
                                        </Upload>
                                    </Form.Item>
                                );
                            }
                        }

                        if (control.componentName == 'file') {
                            var getFileList = control.value;
                            return (
                                <Form.Item
                                    labelCol={control.labelCol ? control.labelCol : labelCol}
                                    wrapperCol={control.wrapperCol ? control.wrapperCol : wrapperCol}
                                    label={control.labelName}
                                    extra={control.extra}
                                    name={control.name}
                                    rules={[control.rules]}
                                    initialValue={control.value}
                                >
                                    <Upload
                                        name={'file'}
                                        fileList={getFileList}
                                        multiple={true}
                                        action={'/api/admin/file/upload'}
                                        headers={{ authorization: 'Bearer ' + sessionStorage['token'] }}
                                        beforeUpload={(file: any) => {
                                            let canUpload = false;
                                            for (var i = 0; i < control.limitType.length; i++) {
                                                if (control.limitType[i] == file.type) {
                                                    canUpload = true;
                                                }
                                            }
                                            if (!canUpload) {
                                                message.error('请上传正确格式的文件!');
                                                return false;
                                            }
                                            const isLtSize = file.size / 1024 / 1024 < control.limitSize;
                                            if (!isLtSize) {
                                                message.error('文件大小不可超过' + control.limitSize + 'MB!');
                                                return false;
                                            }
                                            return true;
                                        }}
                                        onChange={(info: any) => {
                                            let fileList = info.fileList;
                                            fileList = fileList.slice(-control.limitNum);
                                            fileList = fileList.map((file: any) => {
                                                if (file.response) {
                                                    if (file.response.status === 'success') {
                                                        file.url = file.response.data.url;
                                                        file.uid = file.response.data.id;
                                                        file.id = file.response.data.id;
                                                    }
                                                }
                                                return file;
                                            });

                                            fileList = fileList.filter((file: any) => {
                                                if (file.response) {
                                                    return file.response.status === 'success';
                                                }
                                                return true;
                                            });

                                            // dispatch({
                                            //     type: 'form/updateFileList',
                                            //     payload: {
                                            //         fileList: fileList,
                                            //         controlName: control.name
                                            //     }
                                            // });
                                        }}
                                    >
                                        <Button>
                                            <Icon type="upload" /> {control.button}
                                        </Button>
                                    </Upload>
                                </Form.Item>
                            );
                        }

                        if (control.componentName == "map") {
                            const markerEvents = {
                                dragend: (instance: any) => {
                                    // dispatch({
                                    //     type: 'form/updateMapCenter',
                                    //     payload: {
                                    //         longitude: instance.lnglat.lng,
                                    //         latitude: instance.lnglat.lat,
                                    //         controlName: control.name
                                    //     }
                                    // });
                                }
                            }



                            const style = {
                                'position': 'absolute',
                                'top': 20,
                                'right': 10,
                                'border-radius': 4,
                                'border': '1px solid #1890FF',
                                'height': 34,
                                'width': 200,
                                'color': 'rgba(0, 0, 0, 0.65)',
                                'padding': '4px 11px'
                            };

                            // on select item
                            const onMapSelect = (e: any) => {
                                if (e.poi.location) {
                                    // dispatch({
                                    //     type: 'form/updateMapCenter',
                                    //     payload: {
                                    //         longitude: e.poi.location.lng,
                                    //         latitude: e.poi.location.lat,
                                    //         controlName: control.name
                                    //     }
                                    // });
                                }
                            }

                            return (
                                <Form.Item
                                    style={{ 'display': control.display }}
                                    labelCol={control.labelCol ? control.labelCol : labelCol}
                                    wrapperCol={control.wrapperCol ? control.wrapperCol : wrapperCol}
                                    label={control.labelName}
                                    extra={control.extra}
                                    name={control.name}
                                    rules={[control.rules]}
                                    initialValue={control.value}
                                >
                                    <Input size={control.size} style={{ width: '200px', marginBottom: '10px' }} placeholder={control.placeholder} />
                                    <div style={control.style}>
                                        <Map
                                            center={{ longitude: control.value.longitude, latitude: control.value.latitude }}
                                            plugins={[
                                                'ToolBar',
                                            ]}
                                            amapkey={control.key}
                                            zoom={control.zoom}
                                        >
                                            <Autocomplete
                                                options={[]}
                                                onSelect={(e: any) => onMapSelect(e)}
                                                style={style}
                                                placeholder='请输入关键字'
                                            />
                                            <Marker
                                                events={markerEvents}
                                                position={{ longitude: control.value.longitude, latitude: control.value.latitude }}
                                                visible={true}
                                                clickable={true}
                                                draggable={true}
                                            />
                                        </Map>
                                    </div>
                                </Form.Item>
                            );
                        }

                        if (control.componentName == "cascader") {
                            return (
                                <Form.Item
                                    labelCol={control.labelCol ? control.labelCol : labelCol}
                                    wrapperCol={control.wrapperCol ? control.wrapperCol : wrapperCol}
                                    label={control.labelName}
                                    extra={control.extra}
                                    name={control.name}
                                    rules={[control.rules]}
                                    initialValue={control.value}
                                >
                                    <Cascader size={control.size} options={control.options} style={control.style} placeholder={control.placeholder} />
                                </Form.Item>
                            );
                        }

                        if (control.componentName == "searchInput") {

                            let timeout: any;

                            // on select item
                            const onInputSearch = (value: any) => {
                                if (value) {
                                    if (timeout) {
                                        clearTimeout(timeout);
                                        timeout = null;
                                    }

                                    timeout = setTimeout(function () {
                                        // dispatch({
                                        //     type: 'form/updateInputSearch',
                                        //     payload: {
                                        //         actionUrl: control.dataSource,
                                        //         controlName: control.name,
                                        //         search: value
                                        //     }
                                        // });
                                    }, 100);
                                }
                            }

                            if (control.mode) {
                                return (
                                    <Form.Item
                                        labelCol={control.labelCol ? control.labelCol : labelCol}
                                        wrapperCol={control.wrapperCol ? control.wrapperCol : wrapperCol}
                                        label={control.labelName}
                                        extra={control.extra}
                                        name={control.name}
                                        rules={[control.rules]}
                                        initialValue={control.value}
                                    >
                                        <Select
                                            showSearch
                                            defaultActiveFirstOption={false}
                                            mode={control.mode}
                                            size={control.size}
                                            style={control.style}
                                            filterOption={false}
                                            onSearch={(value: any) => onInputSearch(value)}
                                            placeholder={control.placeholder}
                                        >
                                            {!!control.options && control.options.map((option: any) => {
                                                return (<Select.Option key={option.value}>{option.name}</Select.Option>)
                                            })}
                                        </Select>
                                    </Form.Item>
                                );
                            } else {
                                return (
                                    <Form.Item
                                        labelCol={control.labelCol ? control.labelCol : labelCol}
                                        wrapperCol={control.wrapperCol ? control.wrapperCol : wrapperCol}
                                        label={control.labelName}
                                        extra={control.extra}
                                        name={control.name}
                                        rules={[control.rules]}
                                        initialValue={control.value}
                                    >
                                        <Select
                                            showSearch
                                            defaultActiveFirstOption={false}
                                            mode={control.mode}
                                            size={control.size}
                                            style={control.style}
                                            filterOption={false}
                                            onSearch={(value: any) => onInputSearch(value)}
                                            placeholder={control.placeholder}
                                        >
                                            {!!control.options && control.options.map((option: any) => {
                                                return (<Select.Option key={option.value}>{option.name}</Select.Option>)
                                            })}
                                        </Select>
                                    </Form.Item>
                                );
                            }
                        }

                        if (control.componentName == "button") {
                            return (
                                <Form.Item
                                    labelCol={control.labelCol ? control.labelCol : labelCol}
                                    wrapperCol={control.wrapperCol ? control.wrapperCol : wrapperCol}
                                    label={control.labelName}
                                    extra={control.extra}
                                    name={control.name}
                                    rules={[control.rules]}
                                    initialValue={control.value}
                                >
                                    <Button
                                        href={control.href ? control.href : undefined}
                                        size={control.size}
                                        type={control.type}
                                        target={control.target ? control.target : false}
                                        onClick={() => callback(control.onClick['name'], control.onClick['value'], control.onClick['url'])}
                                        style={control.style}
                                    // loading={submitting}
                                    >
                                        {!!control.icon && (<Icon type={control.icon} />)}
                                        {control.name}
                                    </Button>
                                    {!!control.extendButtons && control.extendButtons.map((extendButton: any) => {
                                        if (extendButton == 'cancel') {
                                            return (
                                                <Button style={control.style} onClick={close}>
                                                    取消
                                                </Button>
                                            );
                                        }

                                        if (extendButton == 'reset') {
                                            return (
                                                <Button style={control.style} onClick={reset}>
                                                    重置
                                                </Button>
                                            );
                                        }
                                    })}

                                </Form.Item>
                            );
                        }

                    })}
            </Form>
        </Spin>
    )
}
ModalForm.defaultProps = {
    url: '',
    pageTitle: ""
} as any
export default ModalForm
