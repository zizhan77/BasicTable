/*
 * @Author       : zizhan77©∫
 * @Date         : 2023-02-01 16:22:02
 * @LastEditors  : Please set LastEditors
 * @LastEditTime : 2023-02-07 14:47:58
 * @FilePath     : /b2b_web/src/components/Builder/language/index.tsx
 */
import React, { useEffect, useState } from 'react';
import { request } from '@@/exports';
import { publicUrl } from '@/common/constant';
import { MyColumnType } from '@/components/myForm';
import { Input } from 'antd';
import styles from './index.less'
import { useIntl } from 'umi';


function requestGetJsonList() {
  return request(publicUrl + '/v2/language/jsonList', {
    method: 'post',
  });
}
interface Props {
  value: [{ translation_value: string, lang: string, sort: number }],
  onChange?: (values: any) => void,
  item: MyColumnType
}
// const isJsonString = (str: any) => {
//   if (typeof JSON.parse(str) == "object") {
//     return true;
//   } else {
//     return false;
//   }
// }

const isJsonString = (str: any) => {
  try {
    const toObj = JSON.parse(str) // json字符串转对象
    console.log(toObj);
    // 判断条件 1. 排除null可能性  2. 确保数据是对象或数组
    if (toObj && typeof toObj === 'object') {
      return true
    }
  } catch { }
  return false
}

const Language = (props: Props) => {

  const [list, setList] = useState([]);
  const [dataSource, setDataSource] = useState<any>([]);
  const intl = useIntl();
  const transformIntl = (id: string) => {
    return intl.formatMessage({ id })
  }

  useEffect(() => {
    if (list.length > 0) {
      return
    }
    requestGetJsonList()
      .then(res => {
        const result = JSON.parse(res.data)
        if (props.item.value && isJsonString(props.item.value)) {
          const valueLst = JSON.parse(props.item.value)
          result.forEach((item: any) => {
            const obj: any = valueLst.find((val: any) => val.lang === item.lang);
            item.value = obj.value
          })
          setList(result)

        } else {
          setList(result)

        }
      })

  }, [props.item.value])

  // useEffect(()=> {
  //   if (props.value) {
  //     console.log(props.value);
  //     setDataSource(props.value.map(item => ({...item,value:item.translation_value})))
  //   }else{
  //
  //   }
  // },[props.value])

  const handleChangeValue = (row: any, val: string) => {
    const obj: any = list.find((item: any) => item.code === row.code);
    obj.value = val;
    setDataSource([...list]);
    if (list.every((item: any) => !!item.value)) {
      const jsonList = JSON.stringify(list)
      props.onChange?.(jsonList);
    } else {
      props.onChange?.(undefined);
    }
  }

  return (
    <div>
      {
        list.map((item: any) => {
          return (
            <div className={styles.row}>
              <span className={styles.left}>{item.label}:</span><Input size={item.size} value={item.value} placeholder={transformIntl('component.form.input.placeholder')} onChange={(e: any) => handleChangeValue(item, e.target.value)} />
            </div>
          )
        })
      }
    </div>
  )
}

export default Language
