import React, { useRef, useState, forwardRef, useImperativeHandle, SetStateAction, useEffect } from 'react'
import type { ActionType } from '@ant-design/pro-components'
import { ProTable } from '@ant-design/pro-components'
import { Button, Input, Modal, Form, Col, Row, Popconfirm, Tag, DatePicker, Select, Divider } from "antd";
import { useMount } from 'ahooks'
import styles from './index.less';
import { PaginationProps } from 'antd/es/pagination'
import Icon from '@ant-design/icons';
import moment, { locale } from 'moment';
import ProForm from '../proForm'
interface props {
    dataSource?: object[]
    columns?: object[]
    setData?: object
    pageSize?: number
    bordered?: boolean
    searchConfig?: object[]
    headerTitle?: string
    total?: number
    toolBarRender?: any
    toolbar?: any
    options?: any
    onSelectRow?: (arg0?: any[], arg1?: string[]) => void
    pagination?: PaginationProps
    rowKey?: string
    search?: any
    advancedSearchExpand: boolean
    advancedSearch: any[]
    headerButtons: [];
    pageTitle: string;
    modalFormUrl: string;
    formData: any;
}

const BasicList: React.ForwardRefRenderFunction<any, props> = (props, ref) => {
    const actionRef = useRef<ActionType>()
    const {
        columns = [],
        dataSource = [],
        pageSize = 10,
        bordered = true,
        headerTitle = '',
        total = 0,
        onSelectRow = () => { },
        options,
        pagination,
        rowKey = 'id',
        search,
        advancedSearchExpand,
        advancedSearch,
        headerButtons,
        pageTitle,
        modalFormUrl,
        formData,
        ...reset


    } = props
    const [advancedSearchForm] = Form.useForm()

    // 处理后的表格头部
    const [tableColumns, setTableColumns] = useState<any>([])
    // 表单
    const [modalVisible, setmodalVisible] = useState(false)
    // const { toolBarRender: SearchForm } = props
    useEffect(() => {
        console.log('触发')
        setColum()
    }, [columns])
    //   
    const setColum = () => {
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
                    column.render = (text, row) => (
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
                                                    onClick={() => callback(action.onClick['name'], (action.name == '启用|禁用') ? ((row.status == '正常') ? [row.id, '2'] : [row.id, '1']) : [row.id, action.onClick['value']], action.onClick['url'] + '?id=' + row.id)}
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
                                                <Popconfirm title="确定删除吗？" onConfirm={() => callback(action.onConfirm['name'], [row.id, action.onConfirm['value']], action.onConfirm['url'] + '?id=' + row.id)}>
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
    // ====================
    useImperativeHandle(ref, () => ({
        resetSelectKeys: () => {
            actionRef.current.reset()
        },
    }))

    // 多选框的选择值
    const [selectedKeys, setSelectedKeys] = useState([])
    // 列表复选框选中变化
    const onSelectChange = (selectedRowKeys: SetStateAction<never[]>, selectedRows: any[]) => {
        setSelectedKeys(selectedRowKeys)
        onSelectRow(selectedRowKeys, selectedRows)
    }

    const rowSelection = {
        selectedRowKeys: selectedKeys,
        onChange: onSelectChange,
    }
    const callback = (name: any, value: any[], actionUrl: string) => {
        console.log(name, value, actionUrl)
        if(name == 'changeStatus') {
        //   changeStatus(actionUrl,value);
        }
        if(name == 'multiChangeStatus') {
        //   multiChangeStatus(actionUrl,value);
        }
        if(name == 'search') {
        //   onSearch(actionUrl);
        }
        if(name == 'resetSearch') {
        //   form.resetFields();
        }
        if (name == 'openModal') {
            setmodalVisible(true);
        }
        if(name == 'submit') {
        //   onSubmit(actionUrl,value);
        }
    };
    // const { getFieldDecorator } = advancedSearchForm;
    const closeModal = () => {
        setmodalVisible(false);

    }
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
                                                {/* {getFieldDecorator(control.name, {
                                                    
                                                    initialValue: control.value,
                                                    rules: control.rules
                                                })()} */}
                                                <Input onPressEnter={() => onSearch('')} size={control.size} style={control.style} placeholder={control.placeholder} />
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
                                                    onClick={() => callback(control.onClick['name'], control.onClick['value'], control.onClick['url'])}
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
                                                    size={control.size}
                                                    type={control.type}
                                                    target={control.target ? control.target : false}
                                                    onClick={() => callback(control.onClick['name'], control.onClick['value'], control.onClick['url'])}
                                                    style={control.style}
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
            <SearchForm />
            <ProTable
                rowKey={rowKey}
                rowSelection={rowSelection}
                dataSource={dataSource}
                columns={tableColumns}
                scroll={{ x: 'max-content' }}
                actionRef={actionRef}
                cardBordered
                bordered={bordered}
                // 搜索表单自定义
                search={false}
                // options={{ reload: true, density: false, ...options }}
                size='small'
                pagination={{
                    pageSize: pageSize,
                    total: total,
                    defaultPageSize: 5,
                    showSizeChanger: true,
                    ...pagination,
                }}
                dateFormatter='string'
                headerTitle={headerTitle}
                // 自定义添加operateBar
                // toolBarRender={() => [!!SearchForm && <SearchForm />]}
                {...reset}
            />
            <Modal
                // title={modalTitle}
                // width={modalWidth}
                visible={modalVisible}
                onCancel={closeModal}
                centered={true}
                footer={false}
            >
                <ProForm url={modalFormUrl} pageTitle={pageTitle} pageRandom={''} previewImage={''} previewVisible={false} pageLoading={false} submitting={false} formLayout={undefined} name={''} formData={formData}/>

            </Modal>
        </div>

    )
}
BasicList.defaultProps = {
    dataSource: [],
    columns: [],
    setData: {},
    pageSize: 10,
    bordered: true,
    searchConfig: [],
    headerTitle: '',
    total: 0,
    // SearchForm:null
    onSelectRow: () => { },
    toolbar: null,
    options: {},
    rowKey: 'id',
    search: {}
} as any

export default forwardRef(BasicList)
