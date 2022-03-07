import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'
import { notification } from 'tea-component'
import tips from './tips'

export interface APIRequestOption {
  action: string
  data?: any
  opts?: AxiosRequestConfig
}
export interface ApiResponse {
  code: number
  message: string
}

export async function apiRequest<T>(options: APIRequestOption) {
  const { action, data = {}, opts } = options
  try {
    tips.showLoading({})
    const res = (await axios
      .post<T & ApiResponse>(action, data, {
        ...opts,
      })
      .catch(function(error) {
        if (error.response) {
          notification.error({
            title: '请求错误',
            description: error.response?.data?.info,
          })
        }
      })) as AxiosResponse<T & ApiResponse>
    return res.data
  } catch (e) {
    console.error(e)
  } finally {
    tips.hideLoading()
  }
}
export async function getApiRequest<T>(options: APIRequestOption) {
  const { action, data = {}, opts } = options
  try {
    tips.showLoading({})
    const res = await axios.get<T & ApiResponse>(action, {
      params: data,
      ...opts,
    })
    if (res.status >= 400) {
      throw res
    }
    return res.data
  } catch (e) {
    notification.error(e)
    console.error(e)
  } finally {
    tips.hideLoading()
  }
}
export async function putApiRequest<T>(options: APIRequestOption) {
  const { action, data = {}, opts } = options
  try {
    tips.showLoading({})
    const res = await axios.put<T & ApiResponse>(action, data, {
      ...opts,
    })
    if (res.status >= 400) {
      throw res.data
    }
    return res.data
  } catch (e) {
    console.error(e)
  } finally {
    tips.hideLoading()
  }
}
export async function deleteApiRequest<T>(options: APIRequestOption) {
  const { action, data = {}, opts } = options
  try {
    tips.showLoading({})
    const res = await axios.delete<T & ApiResponse>(action, {
      params: data,
      ...opts,
    })
    if (res.status >= 400) {
      throw res
    }
    return res.data
  } catch (e) {
    notification.error(e)
    console.error(e)
  } finally {
    tips.hideLoading()
  }
}
export interface FetchAllOptions {
  listKey?: string
  totalKey?: string
  limitKey?: string
  offsetKey?: string
}
const DefaultOptions = {
  listKey: 'list',
  totalKey: 'totalCount',
  limitKey: 'limit',
  offsetKey: 'offset',
}
/**
 * 获取所有的列表
 * @param fetchFun 模板函数需要支持pageNo,pageSize参数
 * @param listKey 返回结果中列表的键名称 默认list
 */
export function getAllList(fetchFun: (params?: any) => Promise<any>, options: FetchAllOptions = {}) {
  return async function(params: any) {
    const fetchOptions = { ...DefaultOptions, ...options }
    let allList = [],
      pageNo = 0
    const pageSize = 50
    while (true) {
      // 每次获取获取50条
      params = { ...params }

      const result = await fetchFun({
        ...params,
        [fetchOptions.offsetKey]: pageNo * pageSize,
        [fetchOptions.limitKey]: pageSize,
      } as any)

      allList = allList.concat(result[fetchOptions.listKey])

      if (allList.length >= result[fetchOptions.totalKey]) {
        // 返回
        break
      } else {
        pageNo++
      }
      break
    }
    return {
      list: allList,
      totalCount: allList.length,
    }
  }
}
