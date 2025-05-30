function formatDate(isoString) {
    const d = new Date(isoString);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  }

  async function getUserid() {
    const response = await fetch('/auth/me', {
        method: 'GET',
        credentials: 'include' // Gửi cookie kèm request
    });

    if(response.ok) {
        const data = await response.json();
        console.log(data.user._id)
        return data.user._id
    }
}

async function getStory() {
    const pathSegments = window.location.pathname.split('/');
    const storyId = pathSegments[pathSegments.length - 1];
    console.log(storyId);

    const response = await fetch(`http://localhost:8080/story/${storyId}`);
    const data = await response.json();
    const Container = document.getElementById('detail-container');
    Container.innerHTML = '';

    const storyContent = `
        <div class="row">
            <div class="col-lg-3">
                <div class="anime__details__pic set-bg" data-setbg="../${data.story.URLimage}">
                </div>
            </div>
            <div class="col-lg-9">
                <div class="anime__details__text">
                    <div class="anime__details__title">
                        <h3>${data.story.name}</h3>
                    </div>
                    <p>${data.story.decriptions}</p>
                    <div class="anime__details__widget">
                        <div class="row">
                            <div class="col-lg-8 col-md-8">
                                <ul>
                                    <li><span>Subname:</span> ${data.story.subname}</li>
                                    <li><span>Author:</span> ${data.story.author.name}</li>
                                    <li><span>Status:</span> ${data.story.status}</li>
                                    <li><span>Views:</span> ${data.story.seen}</li>
                                    <li><span>Category:</span> ${data.story.category.map(cat => cat.name).join(', ')}</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div class="anime__details__btn">
                        <a href="#" class="follow-btn" id="follow_btn"><i class="fa fa-heart-o"></i> Follow</a>
                    </div>
                </div>
            </div>
        </div>
    `;
    Container.innerHTML += storyContent;

    const setBg = document.querySelectorAll('.set-bg');
    setBg.forEach(element => {
        const bg = element.getAttribute('data-setbg');
        if (bg) {
            element.style.backgroundImage = `url("${bg}")`;
            console.log("Loading image:", bg);
        }
    });

    document.getElementById('follow_btn').addEventListener('click', async function (event) {
        event.preventDefault();
        const responseFollow = await fetch('http://localhost:8080/follow/check', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({userid: await getUserid(), storyid: data.story._id}),
        })

        if(responseFollow.ok) {
            console.log("Followed already");
            const userId = await getUserid(); // Lấy userId trước
            const responseFollowDelete = await fetch(`http://localhost:8080/follow/${data.story._id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ userid: userId }) // Thêm userId vào body
            });

            if(responseFollowDelete.ok) {
                console.log("Unfollowed successfully");
                window.location.reload(); // Tải lại trang sau khi unfollow
            } else {
                console.error('Failed to unfollow:', await responseFollowDelete.text());
            }
        } else {
            console.log("Not followed yet");
            const responseFollowCreate = await fetch('http://localhost:8080/follow/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({userid: await getUserid(), storyid: data.story._id}),
            });

            if(responseFollowCreate.ok) {
                console.log("Followed successfully");
                window.location.reload(); // Tải lại trang sau khi follow
            }
        }
    });
}

async function getComment() {
    const pathSegments = window.location.pathname.split('/');
    const storyId = pathSegments[pathSegments.length - 1];

    const response = await fetch(`http://localhost:8080/comment/storyComment/${storyId}`);
    const data = await response.json();
    const Container = document.getElementById('review');
    Container.innerHTML = '';

    data.comments.forEach(com=> {
        const commentContent = `
            <div class="anime__review__item__text" style="margin-bottom: 20px;">
                <h6>${com.userId.name}</h6>
                <p>${com.content}</p>
            </div>
        `;
        Container.innerHTML += commentContent;
    });
}

async function getStoryList() {
    const pathSegments = window.location.pathname.split('/');
    const storyId = pathSegments[pathSegments.length - 1];
    console.log(storyId);

    const response = await fetch(`http://localhost:8080/story/${storyId}`);
    const data = await response.json();
    const Container = document.getElementById('chapter');
    Container.innerHTML = '';

    data.story.chapter.forEach(chapter => {
        const chapterContent = `
            <div class="anime__review__item__text" style="margin-bottom: 2px;">
                <a href="/detail/${data.story._id}/${chapter._id}"><p>chapter ${chapter.chapterNumber}<span style="float: right;">${formatDate(chapter.createdAt)}</span></p></a>   
            </div>
        `
        Container.innerHTML += chapterContent;
    });
}

document.getElementById('comment').addEventListener('submit', async function (event) {
    event.preventDefault();

    const responseUser = await fetch('/auth/me', {
        method: 'GET',
        credentials: 'include' // Gửi cookie kèm request
      });
    if(responseUser.ok) {
        const dataUser = await responseUser.json();
        const pathSegments = window.location.pathname.split('/');

        const content = document.getElementById('Ycomment').value;
        const storyid = pathSegments[pathSegments.length - 1];
        const userid = dataUser.user._id;

        console.log(content, storyid, userid);

        const response = await fetch('http://localhost:8080/comment/',{
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({storyid: storyid, userid: userid, content: content}),
        });

        if (response.ok) {
            window.location.reload();
        }

    }
});

getComment();
getStoryList();
getStory();