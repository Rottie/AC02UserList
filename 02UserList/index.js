//主機 api 的 位址
const BASE_URL = 'https://lighthouse-user-api.herokuapp.com'

//代表Index API，顯示所有使用者的訊息
const INDEX_URL = BASE_URL + '/api/v1/users/'


const users = []

//.選擇data panel,代表要把回傳訊息放置地方
const dataPanel = document.querySelector('#data-panel')

/**********************************************************************/
 
//Function 1:顯示使用者資料，資料來源都可以不同類型
function renderUsersList(data) {
  let rawHTML = ''
  data.forEach((item) => {
    rawHTML += `<div class="col-sm-3">
    <div class="mb-2">
      <div class="card">
         <img src="${item.avatar}" class="card-img-top" alt="Movie Poster">
        <div class="card-body">
          <h5 class="card-title">${item.name+` `+item.surname}</h5>
        </div>.
        <div class="card-footer">
          <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#movie-modal" data-id="${item.id}">More</button>
           <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
        </div>
      </div>
    </div>
  </div>`
  })
  dataPanel.innerHTML = rawHTML
}


/**********************************************************************/

/*Function 2:顯示該筆資料詳細訊息*/
function showMovieModal(id) {
  
  //針對 html5裏 id為user-name  做dom 操作，其目的要方便對使用者的姓名做嵌入頁面動作
  const userName = document.querySelector('#user-name')
 //針對 html5裏 id為user-avatar  做dom 操作，其目的要方便對使用者的圖片做嵌入頁面動作
  const userAvatar = document.querySelector('#user-avatar')
   //針對 html5裏 id為user-gender  做dom 操作，其目的要方便對使用者的性別做嵌入頁面動作
  const userGender = document.querySelector('#user-gender')
   //針對 html5裏 id為user-age  做dom 操作，其目的要方便對使用者的年齡做嵌入頁面動作
  const userAge = document.querySelector('#user-age')
   //針對 html5裏 id為user-email  做dom 操作，其目的要方便對使用者的電子郵件做嵌入頁面動作
  const userEmail = document.querySelector('#user-email')
   //針對 html5裏 id為user-region  做dom 操作，其目的要方便對使用者的地區做嵌入頁面動作
  const userRegion = document.querySelector('#user-region')
   //針對 html5裏 id為user-birthday  做dom 操作，其目的要方便對使用者的出生日期做嵌入頁面動作
  const userBirthday = document.querySelector('#user-birthday')


//api網址搭配id后就是特定使用者的api 資訊了
  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data
    //將使用者的名字，性別，年齡，電子郵件，地區，出生日期 用 innerText嵌入修改到more視窗
    userName.innerText = data.name+' '+data.surname
    userGender.innerText=      '  Gender:'  +data.gender
    userAge.innerText =        '    Age :'  +data.age
    userEmail.innerText =      'Email:'  +data.email
    userRegion.innerText =     '  Region:'+data.region
    userBirthday.innerText =   'Birthday:'+ data.birthday   
     //將使用者的照片 用 innerHtml嵌入修改到more視窗
    userAvatar.innerHTML = `<img src="${data.avatar}" alt="movie-poster" class="img-fluid">`
  })
}


/**********************************************************************/
//Function 3:把該筆資料加入到收藏清單
function addToFavorite(id) {

  const list = JSON.parse(localStorage.getItem('favoriteUsers')) || []

  const user = users.find((user) => user.id === id)

  if (list.some((user) => user.id === id)) {
    return alert('此電影已經在收藏清單中！')
  }

  list.push(user)

  localStorage.setItem('favoriteUsers', JSON.stringify(list))
}

/**********************************************************************/
const USERS_PER_PAGE = 16  

//Function 4:獲取該頁面，所以資料，其資料來源可以不一樣
function getUsersByPage(data,page) {
 
  //計算起始 index 
  const startIndex = (page - 1) * USERS_PER_PAGE
  //回傳切割後的新陣列
  return data.slice(startIndex, startIndex + USERS_PER_PAGE)
}



//Function 5:顯示分頁號碼在網頁上
function renderPaginator(amount) {
  //計算總頁數
  const numberOfPages = Math.ceil(amount / USERS_PER_PAGE)
  //製作 template 
  let rawHTML = ''
  
  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }
  //放回 HTML
  paginator.innerHTML = rawHTML
}

//Dom 1：點擊該頁面后，顯示該頁
paginator.addEventListener('click', function onPaginatorClicked(event) {

  if (event.target.tagName !== 'A') return
  
 
  const page = Number(event.target.dataset.page)
  
  renderUsersList(getUsersByPage(users,page))
})



/**********************************************************************/
// Pagination for search page
let filteredUsers = [] //also useful in search algorithm



/*Search Algorithm*/ 

const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input') //新增這裡



searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  event.preventDefault()
  const keyword = searchInput.value.trim().toLowerCase()
  
  
  if (!keyword.length) {
    return alert('請輸入有效字串！')
  }


  filteredUsers = users.filter((user) =>
     
     user.name.toLowerCase().includes(keyword) || user.surname.toLowerCase().includes(keyword)
  )
  //錯誤處理：無符合條件的結果
  if (filteredUsers.length === 0) {
    return alert(`您輸入的關鍵字：${keyword} 沒有符合條件的電影`)
  }
  renderPaginator(filteredUsers.length)
  renderUsersList(getUsersByPage(filteredUsers,1))
})



dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
      showMovieModal(event.target.dataset.id)   
  }else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})



axios.get(INDEX_URL).then((response) => {
    users.push(...response.data.results)
  
    renderPaginator(users.length)
    renderUsersList(getUsersByPage(users,1))
  }).catch((err) => console.log(err))
