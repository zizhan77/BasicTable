/*
 * @Author       : zizhan77
 * @Date         : 2023-01-19 17:53:19
 * @LastEditors  : Please set LastEditors
 * @LastEditTime : 2023-01-28 11:24:21
 * @FilePath     : /b2b_web/src/components/Builder/BasicServe/idnex.ts
 */
import { request } from '@umijs/max';;
import { publicUrl } from "@/common/constant";
const URL = publicUrl + '/v2'

// 获取页面列表
export const getList = (api: string, params: any) => {
    return request(`${URL}/${api}`, {
        method: 'get',
        params

    });
}
// 添加，或者其他post 请求
export const saveData = (api: string, params: any,) => {
    return request(`${URL}/${api}`, {
        method: 'post',
        data: params
    });
}
// 修改
export const editData = (params: any, api: string) => {
    return request(`${URL}/${api}`, {
        method: 'post',
        data: params
    });
}
// 删除
export const deleteData = (id: string, api: string) => {
    return request(`${URL}/${api}/${id}`, {
        method: 'delete',
    });
}
//   get获取新增表单参数
export const getCreateFormData = (api: string) => {
    return request(`${URL}/${api}`, {
        method: 'get',
    });
}
//   get获取编辑表单参数
export const getEditFormData = (api: string, id: string) => {
    return request(`${URL}/${api}?id=${id}`, {
        method: 'get',
    });
}