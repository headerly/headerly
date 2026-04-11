# Headerly E2E Test Plan

本测试计划涵盖 Headerly 扩展程序的核心功能 E2E 测试。测试将使用 Playwright 框架，通过模拟用户在 Popup UI 中的交互操作，并验证这些操作是否正确地转化为底层的 Declarative Net Request (DNR) 规则，从而对实际网络请求产生预期的影响。

## 一、 测试环境与配置准备

1. **扩展加载**:
   - 使用 Playwright 的 `chromium.launchPersistentContext` 加载已构建的未打包扩展程序目录（如 `extension/.output` 或 `extension/dist`）。
   - 禁用无头模式 (`headless: false`)，因为部分扩展功能在无头模式下可能表现不一致，且需要测试扩展弹窗。
2. **测试目标接口**:
   - 准备一个用于捕获并返回请求头、Cookie 等信息的测试接口。例如使用 `httpbin.org/anything` 或在本地使用 Node/Express 启动一个简单的 Echo Server，以便断言 HTTP 请求中的实际内容。
3. **前置操作**:
   - 每次测试开始前，导航至扩展的 Popup UI 页面 (例如 `chrome-extension://[id]/popup/index.html`)，确保页面正确渲染，各项功能可用。
   - 测试结束后，清空当前配置（重置状态），保证用例间相互隔离。

---

## 二、 测试用例列表

### 1. 添加请求头 (Add Request Header)
- **目标**: 验证用户可以在 UI 中新增一个 Request Header，并在发起的请求中成功携带该 Header。
- **前置条件**: 打开 Popup UI。
- **测试步骤**:
  1. 点击 “添加请求头” 相关按钮。
  2. 输入自定义的 Header Name (如 `X-Test-Add`) 和 Header Value (如 `Playwright-Value`)。
  3. 确保该配置项已勾选/开启。
  4. 新开 Tab，向测试接口发起一次 GET 请求。
- **预期结果**:
  - 测试接口的响应包中，包含了 `X-Test-Add: Playwright-Value`。

### 2. 修改现有请求头 (Modify Existing Request Header)
- **目标**: 验证用户通过 Headerly 设置的请求头可以覆盖浏览器默认发出的同名请求头。
- **前置条件**: 打开 Popup UI。
- **测试步骤**:
  1. 点击 “添加请求头”。
  2. 输入 Name: `User-Agent`，Value: `Headerly-Custom-UA`。
  3. 开启规则。
  4. 新开 Tab 请求测试接口。
- **预期结果**:
  - 接口接收到的 `User-Agent` 被成功修改为 `Headerly-Custom-UA`，而不是 Playwright 的默认浏览器 UA。

### 3. 删除请求头 (Remove Request Header)
- **目标**: 验证用户可以移除发包时默认携带的指定请求头。
- **前置条件**: 打开 Popup UI。
- **测试步骤**:
  1. 添加一个类型为 “移除请求头” (Remove Header) 的配置项。
  2. 输入要删除的 Header Name: `Accept-Language`。
  3. 开启规则。
  4. 新开 Tab 请求测试接口。
- **预期结果**:
  - 测试接口收到的请求 Header 列表中，**不存在** `Accept-Language` 字段。

### 4. 模式切换：单选/复选框模式 (Radio / Checkbox Modes)
- **目标**: 验证在一个 Profile（配置文件）内，切换条目的单选/多选模式，是否能正确互斥或叠加，且只让选中的规则生效。
- **前置条件**: 打开 Popup UI，创建两个请求头条目：Item A (`X-Mode: A`)，Item B (`X-Mode: B`)。
- **测试步骤 (复选模式)**:
  1. 将 UI 模式设置为 "Checkbox" (默认可能是复选)。
  2. 勾选 Item A，再勾选 Item B。
  3. 发起网络请求。
  4. **预期结果**: 请求中同时携带了 `X-Mode: A` 和 `X-Mode: B`。
- **测试步骤 (单选模式)**:
  1. 将 UI 模式切换为 "Radio"。
  2. 此时点击选中 Item A，再点击选中 Item B。
  3. **预期结果 (UI)**: UI 上仅有 Item B 处于选中状态，Item A 自动取消勾选。
  4. 发起网络请求。
  5. **预期结果 (网络)**: 请求头中只携带了 `X-Mode: B`，没有 `X-Mode: A`。

### 5. 过滤条件功能 (Filters)
- **目标**: 验证设置了过滤条件后，规则只对命中条件的请求生效。
- **测试用例 5.1: 域名/URL 关键字匹配**
  1. 添加请求头 `X-Filter: DomainMatch`。
  2. 添加一个 Filter：限制 URL 包含字符串 `example.com`。
  3. 开启规则。
  4. **步骤**: 分别向 `http://example.com` 和 `https://httpbin.org/anything` 发起请求。
  5. **预期结果**: 只有发向 `example.com` 的请求带上了该请求头。
- **测试用例 5.2: 资源类型匹配 (Resource Types)**
  1. 添加请求头 `X-Filter: ImageOnly`。
  2. 添加一个 Filter：资源类型 (Resource Type) 限制为 `image`。
  3. 开启规则。
  4. **步骤**: 在测试页面中发起一个正常的 API 请求 (`fetch`)，并在 DOM 中动态插入一个 `<img>` 标签加载图片。
  5. **预期结果**: API 请求未携带该请求头，而图片请求携带了该请求头。
- **测试用例 5.3: 正则表达式匹配 (Regex Filter)**
  1. 添加请求头 `X-Filter: RegexMatch`。
  2. 添加一个 Filter：使用正则表达式 `.*\/api\/v[1-9]\/.*`。
  3. 开启规则。
  4. **步骤**: 分别请求 `/api/v1/users` 和 `/api/v0/users`。
  5. **预期结果**: 只有对 `/api/v1/users` 的请求携带了该头。

### 6. Cookie 同步与修改 (Cookie Sync)
- **目标**: 验证 Cookie 相关的规则或同步功能能够正确操作请求中的 Cookie。
- **前置条件**: 打开 Popup UI。
- **测试步骤**:
  1. 在 UI 中开启 “Cookie Sync” 选项或添加 Cookie 修改规则。
  2. 输入自定义的 Cookie (如 `Custom-Token=ABC12345`)。
  3. 访问测试网页。
- **预期结果**:
  - 请求头中的 `Cookie` 字段包含了 `Custom-Token=ABC12345`。
  - （根据功能实现细节，也可在页面的 `document.cookie` 中验证是否能读取到相应内容）。

### 7. 数据持久化 (Data Persistence)
- **目标**: 验证扩展在页面重载或关闭后，规则依然生效且数据不丢失。
- **前置条件**: 无。
- **测试步骤**:
  1. 打开 Popup UI，配置一个测试头 `X-Persist: true`。
  2. 关闭 Popup UI 页面。
  3. (可选) 重新加载扩展 / 刷新页面上下文。
  4. 不打开 Popup，直接发起一次网络请求。
- **预期结果**:
  - 请求中仍然包含 `X-Persist: true`。
  - 再次打开 Popup UI，配置的记录及选中状态依然存在。