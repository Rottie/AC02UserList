//主機 api 的 位址
const BASE_URL = 'https://lighthouse-user-api.herokuapp.com'

//代表Index API，顯示所有使用者的訊息
const INDEX_URL = BASE_URL + '/api/v1/users/'



const users = JSON.parse(localStorage.getItem('favoriteUsers'))


//.選擇data panel,代表要把回傳訊息放置地方
const dataPanel = document.querySelector('#data-panel')

 
//ID.針對每筆資料，把api 其中幾項需要資料嵌入在每筆資料
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
         <button class="btn btn-danger btn-remove-favorite" data-id="${item.id}">x</button>
        </div>
      </div>
    </div>
  </div>`
  })
  dataPanel.innerHTML = rawHTML
}




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


function removeFromFavorite(id) {
  if(!users) return

  //透過 id 找到要刪除電影的 index
  const userIndex = users.findIndex((user) => user.id === id)
  if(userIndex === -1) return

  //刪除該筆電影
  users.splice(userIndex,1)

  //存回 local storage
  localStorage.setItem('favoriteUsers', JSON.stringify(users))

  //更新頁面
  renderUsersList(users)
}






/*Pagination Algorithm   */


//1.修改一頁有16筆資料
const USERS_PER_PAGE = 16  



//2.修改了，新增data 參數，因爲data 有兩種不同來源，第一是原本收藏所有資料，第二是搜尋后剩下的資料數量
function getUsersByPage(data,page) {
  //計算起始 index 
  const startIndex = (page - 1) * USERS_PER_PAGE
  //回傳切割後的新陣列
  //原本users 的資料來源 改成參數，因爲有2種不同資料要使用此函數
  return data.slice(startIndex, startIndex + USERS_PER_PAGE)
}




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
    return alert(`您輸入的關鍵字：${searchInput.value} 沒有符合條件的電影`)
  }
  //計算搜尋篩選后資料需要的縂分頁數
  renderPaginator(filteredUsers.length)
  //一樣顯示第一頁，但資料來源是搜尋后剩下資料數量，並不是所有收藏清單資料縂數量
  renderUsersList(getUsersByPage(filteredUsers,1))
})




//點擊當下分頁，就顯示當下分頁的資料
paginator.addEventListener('click', function onPaginatorClicked(event) {
  //如果被點擊的不是 a 標籤，結束
  if (event.target.tagName !== 'A') return
  
  //透過 dataset 取得被點擊的頁數
  const page = Number(event.target.dataset.page)
  
  //更新畫面
  //!!users 來源為收藏清單所有資料
  renderUsersList(getUsersByPage(users,page))
})



//點擊 datapanel大範圍，如果點擊到執行以下程式
dataPanel.addEventListener('click', function onPanelClicked(event) {
  //點擊到 more 按鍵，就顯示該筆資料詳細資料
  if (event.target.matches('.btn-show-movie')) {
      showMovieModal(event.target.dataset.id)
  //點擊到 刪除 按鍵，就把該筆資料從收藏清單刪除   
  }else if (event.target.matches('.btn-remove-favorite')) {
    removeFromFavorite(Number(event.target.dataset.id))
  }
})

//計算收藏清單所有資料的縂分頁數
renderPaginator(users.length)

//顯示第一頁收藏清單，資料來源為收藏清單所有資料
renderUsersList(getUsersByPage(users,1))

