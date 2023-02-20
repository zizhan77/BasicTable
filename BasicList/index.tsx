/*
 * @Author       : zizhan77
 * @Date         : 2023-01-19 14:01:58
 * @LastEditors  : Please set LastEditors
 * @LastEditTime : 2023-02-07 14:48:17
 * @FilePath     : /b2b_web/src/components/Builder/BasicList/index.tsx
 */
import React, { useState,  useEffect } from 'react'
import { ProTable } from '@ant-design/pro-components'
import { Button, Input, Modal, Form, Col, Row, Popconfirm, Tag, DatePicker, Select, Divider, message } from "antd";
import styles from './index.less';
import { PaginationProps } from 'antd/es/pagination'
import Icon from '@ant-design/icons';
import moment, { locale } from 'moment';
import { useMount } from 'ahooks'
import ModalForm from '../ModalForm';
// ，模拟数据

// 请求封装
import { getList, saveData, deleteData, getCreateFormData, getEditFormData } from '../BasicServe/idnex'

const { RangePicker } = DatePicker;

interface props {
    url: any
}

const BasicList: React.FC<props> = ({ url }) => {
    const [pageTitle, setPageTitle] = useState('默认标题')//页面标题
    const [headerButtons, setHeaderButtons] = useState<any[]>([])//页面头部的按钮
    const [toolbarButtons, setToolbarButtons] = useState<any>([])//头部表格方法

    // 搜索配置
    const [searchForm] = Form.useForm(); //普通搜索
    const [search, setSearch] = useState<any[]>([])//普通搜索组件配置

    const [advancedSearchForm] = Form.useForm() //高级搜索控件
    const [advancedSearch, setadvancedSearch] = useState<any[]>([])//高级搜索组件配置
    const [advancedSearchExpand, setadvancedSearchExpand] = useState<Boolean>(false)//控制高级搜索展示

    // 表格配置数据
    const [selectedRowKeys, setselectedRowKeys] = useState<any[]>([])//选择
    const [tableColumns, setTableColumns] = useState<any[]>([])
    const [tableDataSource, setTableDataSource] = useState<any[]>([])
    const [tablePagination, setTablePagination] = useState<any>({
        current: 1, pageSize: 10
    })
    const [tableLoading, setTableLoading] = useState<any>(false)
    // 弹窗配置
    const [modalTitle, setModalTitle] = useState('')
    const [modalWidth, setModalWidth] = useState(0)
    const [modalVisible, setmodalVisible] = useState(false)
    const [modalUrl, setModalUrl] = useState('')
    const [modalFormData, setModalFormData] = useState({})

    //  编辑数据
    const [editData, setEditData] = useState<any>({})

    // 按钮加载
    const [loadings, setLoadings] = useState<boolean>(false);

    // 获取数据
    useEffect(() => {
        getInitData({
            ...tablePagination
        }, null)
    }, [url])

    // 获取数据方法
    const getInitData = (par: any, submitUrl: any) => {
        setTableLoading(true)
        getList(submitUrl ? submitUrl : url, par).then((res: any) => {
            if (res.code == 200) {
                const { headerButtons, advancedSearch, pageTitle, search, table: { columns, dataSource, pagination, }, toolbarButtons } = res.data
                setadvancedSearch(advancedSearch)
                setColum(columns)
                setPageTitle(pageTitle)
                setHeaderButtons(headerButtons)
                setSearch(search)
                setToolbarButtons(toolbarButtons)
                setTableDataSource(dataSource)
                setTablePagination(pagination)

                setTableLoading(false)
                setselectedRowKeys([])
            }
        })

    }
    // 直接请求
    // const 
    // ===============表格相关开始================
    // 处理操作栏
    const setColum = (columns: any) => {
        let columnArr = [...columns]
        if (columnArr) {
            columnArr.map((column: any, key: any) => {

                if (column.render) {
                    let renderText = column.render;
                    column.render = (text: any, row: any) => (
                        <span>
                            {eval(renderText)}
                        </span>
                    )
                }

                if (column.isImage) {
                    column.render = (text: any, row: any) => (
                        <img src={text} width={40} height={40}></img>
                    )
                }

                if (column.isIcon) {
                    column.render = (text: any, row: any) => (
                        <Icon type={text} />
                    )
                }

                if (column.a) {
                    if (column.a['href'].indexOf("?") != -1) {
                        column.render = (text: any, row: any) => (
                            <a href={column.a['href'] + '&id=' + row.id} target={column.a['target']}>
                                {text}
                            </a>
                        )
                    } else {
                        column.render = (text: any, row: any) => (
                            <a href={column.a['href'] + '?id=' + row.id} target={column.a['target']}>
                                {text}
                            </a>
                        )
                    }
                }

                if (column.isImage && column.a) {

                    if (column.a['href'].indexOf("?") != -1) {
                        column.render = (text: any, row: any) => (
                            <a href={column.a['href'] + '&id=' + row.id} target={column.a['target']}>
                                <img src={text} width={40} height={40}></img>
                            </a>
                        )
                    } else {
                        column.render = (text: any, row: any) => (
                            <a href={column.a['href'] + '?id=' + row.id} target={column.a['target']}>
                                <img src={text} width={40} height={40}></img>
                            </a>
                        )
                    }
                }

                if (column.tag) {
                    column.render = (text: any, row: any) => (
                        <span>
                            <Tag color={eval(column.tag)}>{text}</Tag>
                        </span>
                    )
                }

                if (column.actions) {
                    column.render = (text: any, row: any) => (
                        <span>
                            {
                                columnArr[key].actions.map((action: any, key: any) => {

                                    if (action.componentName == "button") {

                                        let actionHref = '';

                                        if (action.href) {
                                            if (action.href.indexOf("?") != -1) {
                                                actionHref = action.href + '&id=' + row.id;
                                            } else {
                                                actionHref = action.href + '?id=' + row.id;
                                            }
                                        }

                                        return (
                                            <span>
                                                <Button
                                                    href={actionHref ? actionHref : undefined}
                                                    size={action.size}
                                                    type={action.type}
                                                    target={action.target ? action.target : false}
                                                    onClick={() => callback(action.onClick['name'], (action.name == '启用|禁用') ? ((row.status == '正常') ? [row.id, '2'] : [row.id, '1']) : action.onClick['value'], action.onClick['url'], row)}
                                                    style={action.style}
                                                >
                                                    {!!action.icon && (<Icon type={action.icon} />)}
                                                    {(action.name == '启用|禁用') ? ((row.status == '正常') ? ('禁用') : ('启用')) : (action.name)}
                                                </Button>
                                            </span>
                                        );
                                    }

                                    if (action.componentName == "popconfirm") {
                                        return (
                                            <span>
                                                <Popconfirm title="确定删除吗？" onConfirm={() => callback(action.onConfirm['name'], [row.id, action.onConfirm['value']], action.onConfirm['url'])}>
                                                    <Button
                                                        size={action.size}
                                                        type={action.type}
                                                        style={action.style}
                                                    >
                                                        {!!action.icon && (<Icon type={action.icon} />)}
                                                        {action.name}
                                                    </Button>
                                                </Popconfirm>
                                            </span>
                                        );
                                    }
                                })
                            }
                        </span>
                    );
                }
                columnArr[key] = column;
            })
            setTableColumns(columnArr)

        }

    }
    // 展开或收缩高级搜索
    const toggle = () => {
        setadvancedSearchExpand(!advancedSearchExpand)
    };
    // 列表复选框选中变化
    const onSelectChange = (selectedRowKeys: any, selectedRows: any[]) => {
        setselectedRowKeys(selectedRowKeys)
    }
    // 复选框配置
    const rowSelection = {
        selectedRowKeys: selectedRowKeys,
        onChange: onSelectChange,
    }
    // 分页切换
    const changePagination = (pagination: any, filters: any, sorter: any) => {
        setTablePagination(pagination)
        getInitData({ ...pagination }, null)
    };
    // ===============表格相关结束================

    // 页面内按钮回调方法
    const callback = (name: any, value: any[], actionUrl: string, data = { id: null }) => {
        console.log(name, actionUrl, value)
        setLoadings(true)
        if (name == 'changeStatus') {
            changeStatus(value, actionUrl);
        }
        if (name == 'multiChangeStatus') {
            //   multiChangeStatus(actionUrl,value);
            if (selectedRowKeys.length == 0) {
                message.error("请选择数据")
            } else {
                // multiChangeStatus()
                changeStatus([selectedRowKeys, value], actionUrl);
            }
        }
        if (name == 'search') {
            onSearch(actionUrl);
        }
        if (name == 'resetSearch') {
            searchForm.resetFields()
            advancedSearchForm.resetFields()
        setLoadings(false)

        }
        if (name == 'openModal') {
            setTableLoading(true)
            setEditData(data)
            // 编辑
            if (data.id) {
                if (editData) {
                    getEditFormData(actionUrl, data.id).then(res => {
                        console.log( 'data.id', res,)
                        if (res.code == 200) {
                            setModalFormData(res.data)
                            openModal(value, actionUrl)

                        }
                    })
                }
            } else {
                //  新增
                getCreateFormData(actionUrl).then(res => {
                    if (res.code == 200) {
                        setModalFormData(res.data)
                        openModal(value, actionUrl)
                    }
                })
            }
        }
        if (name == 'submit') {
            onSubmit(actionUrl, value);
        }


    };
    // 直接发起请求
    const onSubmit = (url: any, value: any) => {

        // message.loading

        saveData(url, { ...value },).then(res => {
            // if (res.code == 200) {
            //     message.success(res.msg)

            // } else {
            //     message.error(res.msg ? res.msg : '请求错误！')
            // }
            // message.destroy
            getInitData({ ...tablePagination }, null)
        setLoadings(false)

        })
    }
    // 修改状态
    const changeStatus = (value: any[], actionUrl: string) => {
        // value第一个是 ID 第二个是状态
        saveData(actionUrl, {
            id: value[0],
            status: value[1]
        }).then(res => {
            if (res.code == 200) {
                message.success(res.msg)

                getInitData({ ...tablePagination }, null)
                setLoadings(false)

            } else {
                message.error(res.msg)
            }
        })
    }
    // ===============弹窗相关开始================
    const closeModal = (e = 0) => {
        if (e) {
            getInitData({ ...tablePagination }, null)
        }
        setEditData({})
        setmodalVisible(false)
        setLoadings(false)
    }
    const openModal = (value: any, actionUrl: any) => {
        setTableLoading(false)
        setLoadings(false)
        setModalTitle(value.title)
        setModalWidth(value.width)
        setModalUrl(actionUrl)
        setmodalVisible(true)
    }
    // ===============弹窗相关结束================

    // 搜索
    const onSearch = (actionUrl: string) => {

        let forms = searchForm
        if (actionUrl == 'searchForm') {
            forms = searchForm
        } else if (actionUrl == 'advancedSearchForm') {
            forms = advancedSearchForm
        }
        setTablePagination({ current: 1, pageSize: 10, ...tablePagination })

        getInitData({ ...forms.getFieldsValue(), ...tablePagination }, null)
        setLoadings(false)


    };

    // 搜索组件
    const SearchForm = () => {
        return (
            <div
                className={styles.tableAdvancedSearchBar}
                style={{ display: advancedSearchExpand ? 'block' : 'none' }}
            >
                <Row>
                    <Col span={24}>
                        <Form layout="inline" form={advancedSearchForm} >
                            {!!advancedSearch &&
                                advancedSearch.map((control: any) => {
                                    if (control.componentName == "input") {
                                        return (
                                            <Form.Item
                                                labelCol={control.labelCol}
                                                wrapperCol={control.wrapperCol}
                                                extra={control.extra}
                                                label={control.labelName}
                                            >
                                                <Input allowClear onPressEnter={() => onSearch('')} size={control.size} style={control.style} placeholder={control.placeholder} />
                                            </Form.Item>
                                        );
                                    }

                                    if (control.componentName == "select") {
                                        return (
                                            <Form.Item
                                                labelCol={control.labelCol}
                                                wrapperCol={control.wrapperCol}
                                                extra={control.extra}
                                                label={control.labelName}
                                            >
                                                {/* {getFieldDecorator(control.name, {
                                                    initialValue: control.value
                                                        ? control.value.toString()
                                                        : undefined,
                                                    rules: control.rules
                                                })(
                                                   
                                                )} */}
                                                <Select size={control.size} style={control.style} placeholder={control.placeholder}>
                                                    {!!control.options && control.options.map((option: any) => {
                                                        return (<Select.Option key={option.value}>{option.name}</Select.Option>)
                                                    })}
                                                </Select>
                                            </Form.Item>
                                        );
                                    }

                                    if (control.componentName == "datePicker") {
                                        return (
                                            <Form.Item
                                                labelCol={control.labelCol}
                                                wrapperCol={control.wrapperCol}
                                                extra={control.extra}
                                                label={control.labelName}
                                            >
                                                {/* {getFieldDecorator(control.name, {
                                                    initialValue: !!control.value && moment(control.value, control.format),
                                                    rules: control.rules
                                                })(
                                                   
                                                )} */}
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
                                                labelCol={control.labelCol}
                                                wrapperCol={control.wrapperCol}
                                                label={control.labelName}
                                                extra={control.extra}
                                            >
                                                {/* {getFieldDecorator(control.name, {
                                                    initialValue: [
                                                        !!control.value[0] && moment(control.value[0], control.format),
                                                        !!control.value[1] && moment(control.value[1], control.format)
                                                    ],
                                                    rules: control.rules
                                                })(
                                                    
                                                )} */}
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

                                    if (control.componentName == "button") {
                                        return (
                                            <Form.Item
                                                labelCol={control.labelCol}
                                                wrapperCol={control.wrapperCol}
                                                label={control.labelName}
                                                extra={control.extra}
                                            >
                                                <Button
                                                    href={control.href ? control.href : false}
                                                    size={control.size}
                                                    type={control.type}
                                                    target={control.target ? control.target : false}
                                                    onClick={() => callback(control.onClick['name'], control.onClick['value'], 'advancedSearchForm')}
                                                    style={control.style}
                                                >
                                                    {!!control.icon && (<Icon type={control.icon} />)}
                                                    {control.name}
                                                </Button>
                                            </Form.Item>
                                        );
                                    }

                                })}
                        </Form>
                    </Col>
                </Row>

            </div>

        )
    }
    return (
        <div>
            {/* 页面 title 及新增按钮 */}
            <div className={styles.tableHeader}>
                <Row justify="start">
                    <Col span={12}>
                        <h5 className={styles.tableHeaderTitle}>{pageTitle}</h5>
                    </Col>
                    <Col span={12}>
                        <div className={styles.floatRight}>
                            <Form layout="inline">
                                {!!headerButtons &&
                                    headerButtons.map((control: any) => {
                                        return (
                                            <Form.Item
                                                labelCol={control.labelCol}
                                                wrapperCol={control.wrapperCol}
                                                extra={control.extra}
                                            >
                                                <Button
                                                    href={control.href ? control.href : false}
                                                    // href='/suppliers/add'

                                                    size={control.size}
                                                    type={control.type}
                                                    target={control.target ? control.target : false}
                                                    onClick={() => callback(control.onClick['name'], control.onClick['value'], control.onClick['url'])}
                                                    style={control.style}
                                                    loading={control.href ? false :loadings}
                                                >
                                                    {!!control.icon && (<Icon type={control.icon} />)}
                                                    {control.name}
                                                </Button>
                                            </Form.Item>
                                        );
                                    })}
                            </Form>
                        </div>
                    </Col>
                </Row>
            </div>
            <Divider style={{ marginBottom: 10, marginTop: 10 }} />
            {/* 普通搜搜组件 */}
            <div className={styles.tableToolBar}>
                <Row justify="start">
                    <Col>
                        {/* <div className={styles.floatRight}> */}
                        <Form layout="inline" form={searchForm}>
                            {search &&
                                search.map((control: any) => {
                                    if (control.componentName == "input") {
                                        return (
                                            <Form.Item
                                                labelCol={control.labelCol}
                                                wrapperCol={control.wrapperCol}
                                                extra={control.extra}
                                                name={control.name}
                                            >
                                                <Input allowClear onPressEnter={() => onSearch('')} size={control.size} style={control.style} placeholder={control.placeholder} />
                                            </Form.Item>
                                        );
                                    }

                                    if (control.componentName == "select") {
                                        return (
                                            <Form.Item
                                                name={control.name}
                                                labelCol={control.labelCol}
                                                wrapperCol={control.wrapperCol}
                                                extra={control.extra}
                                            >
                                                <Select size={control.size} style={control.style} placeholder={control.placeholder}>
                                                    {!!control.options && control.options.map((option: any) => {
                                                        return (<Select.Option key={option.value}>{option.name}</Select.Option>)
                                                    })}
                                                </Select>
                                            </Form.Item>
                                        );
                                    }

                                    if (control.componentName == "datePicker") {
                                        return (
                                            <Form.Item
                                                name={control.name}
                                                labelCol={control.labelCol}
                                                wrapperCol={control.wrapperCol}
                                                extra={control.extra}
                                            >
                                                <DatePicker
                                                    showTime={control.showTime}
                                                    size={control.size}
                                                    style={control.style}
                                                    format={control.format}
                                                    placeholder={control.placeholder}
                                                />
                                            </Form.Item>
                                        );
                                    }

                                    if (control.componentName == "rangePicker") {
                                        return (
                                            <Form.Item
                                                name={control.name}
                                                labelCol={control.labelCol}
                                                wrapperCol={control.wrapperCol}
                                                extra={control.extra}
                                            >
                                                <RangePicker
                                                    showTime={control.showTime}
                                                    size={control.size}
                                                    style={control.style}
                                                    format={control.format}
                                                />
                                            </Form.Item>
                                        );
                                    }

                                    if (control.componentName == "button") {
                                        return (
                                            <Form.Item
                                                labelCol={control.labelCol}
                                                wrapperCol={control.wrapperCol}
                                                extra={control.extra}
                                            >
                                                <Button
                                                    href={control.href ? control.href : false}
                                                    size={control.size}
                                                    type={control.type}
                                                    target={control.target ? control.target : false}
                                                    onClick={() => callback(control.onClick['name'], control.onClick['value'], 'searchForm')}
                                                    style={control.style}
                                                >
                                                    {!!control.icon && (<Icon type={control.icon} />)}
                                                    {control.name}
                                                </Button>
                                            </Form.Item>
                                        );
                                    }

                                })}
                            {(advancedSearch.length != 0) && (
                                <Form.Item style={{ marginRight: 10 }}>
                                    <a style={{ fontSize: 12 }} onClick={toggle}>
                                        高级搜索 <Icon type={advancedSearchExpand ? 'up' : 'down'} />
                                    </a>
                                </Form.Item>
                            )}
                        </Form>
                        {/* </div> */}
                    </Col>
                </Row>
            </div>
            {/* 高级搜索组件 */}
            <SearchForm />
            {/* 表格 */}
            <div className={styles.tableData}>
                <ProTable
                    search={false}
                    dateFormatter='string'
                    cardBordered
                    scroll={{ x: 1000 }}
                    rowKey={(record: any) => record.id}
                    rowSelection={rowSelection}
                    columns={tableColumns}
                    dataSource={tableDataSource}
                    pagination={tablePagination}
                    loading={tableLoading}
                    onChange={changePagination}
                    // formRef="tableRef"
                    options={
                        {
                            reload: () => {
                                getInitData({ ...tablePagination }, null)
                            }
                        }
                    }
                    bordered
                    // onr
                    toolBarRender={() => {
                        return toolbarButtons.map((control: any) => {
                            return (
                                <Button
                                    href={control.href ? control.href : false}
                                    size={control.size}
                                    type={control.type}
                                    target={control.target ? control.target : false}
                                    onClick={() => callback(control.onClick['name'], control.onClick['value'], control.onClick['url'])}
                                    style={control.style}
                                >
                                    {!!control.icon && (<Icon type={control.icon} />)}
                                    {control.name}
                                </Button>
                            );
                        })
                    }}
                />
            </div>
            {modalTitle && (
                <Modal
                    title={modalTitle}
                    width={modalWidth}
                    visible={modalVisible}
                    onCancel={() => closeModal()}
                    centered={true}
                    footer={false}
                    destroyOnClose
                >
                    <ModalForm url={modalUrl} editData={editData} formData={modalFormData} close={e => closeModal(e)} />
                </Modal>
            )}
        </div>

    )
}
BasicList.defaultProps = {
    url: ''
} as any

export default BasicList
