const rce = React.createElement;

function Notif(data, i){
  let text = rce(
    "div",
    {className: "notif-text"},
    [
      rce(
        "a",
        {
          key: 0,
          href: data.user,
          className: "notif-user-name"
        },
        data.userName
      )
    ]
  );
  
  let time = rce(
    "div",
    {className: "notif-time"},
    []
  );
  
  let msgText = "";
  let picture = "";
  
  // A function to add the appropriate content for
  // each target type
  function getTarget(){
    switch (data.targetType){
      case "post":
        text.props.children.push(
          " recent post ",
          rce(
            "a",
            {
              key: 1,
              href: data.target,
              className: "notif-target-name"
            },
            data.targetTitle
          )
        );
        break;
      case "group":
        text.props.children.push(
          " group ",
          rce(
            "a",
            {
              key: 1,
              href: data.target,
              className: "notif-target-name"
            },
            data.targetTitle
          )
        );
        break;
      case "picture":
        text.props.children.push(" picture");
        picture = rce(
          "a",
          {
            href: data.target,
            className: "notif-picture"
          },
          rce(
            "img",
            {
              src: data.targetThumbnail,
              alt: data.targetTitle
            }
          )
        );
        break;
      case "chat":
        msgText = rce(
          "a",
          {
            href: data.target,
            title: "Open chat...",
            className: "notif-msg-text"
          },
          data.actionContent
        );
        break;
    }
  }
  
  // Set the appropriate text for each action type
  // and call `getTarget()` only when needed
  switch (data.actionType){
    case "follow":
      text.props.children.push(" followed you");
      break;
    case "message":
      text.props.children.push(" sent you a private message");
      getTarget();
      break;
    case "reaction":
      text.props.children.push(" reacted to your");
      getTarget();
      break;
    case "comment":
      text.props.children.push(" commented on your");
      getTarget();
      break;
    case "join":
      text.props.children.push(" has joined your");
      getTarget();
      break;
    case "leave":
      text.props.children.push(" left the");
      getTarget();
      break;
  }
  
  // Get time info from `data.elapsedTime` and
  // return the appropriate time representation
  {
    const x = data.elapsedTime.indexOf("/");
    const a = data.elapsedTime.substring(x + 1).split(":");
    
    const d = +data.elapsedTime.substring(0,x);
    const [h, m, s] = a.map(v => +v);
    
    const Y = Math.trunc(d / 365);
    const M = Math.trunc(d / 30);
    const W = Math.trunc(d / 7);
    
    const c = [" year"," month"," week"," day","h","m","s"];
    
    [Y, M, W, d, h, m, s].forEach((e, index, array) => {
      if (!array[index - 1] && e){
        const plural_S = (index < 4 && e > 1) ? "s" : "";
        time.props.children.push(
          e + c[index] + plural_S + " ago"
        );
      }
    });
  }
  
  ////////////////////////////////////////////////////////////
  
  return rce(
    "div",
    {
      key: i,
      className: "notif" + (data.isUnread ? " unread" : "")
    },
    rce(
      "img",
      {
        className: "notif-avatar",
        src: data.userAvatar,
        alt: "Avatar of " + data.userName
      }
    ),
    rce(
      "div",
      {
        className: "notif-content" +
                   (data.targetType == "picture" ? " has-picture" : "")
      },
      text,
      time,
      msgText,
      picture
    )
  );
}

function NotifHeader(unreadNum, markAllAsRead){
  return rce(
    "div",
    {className: "notif-header"},
    rce(
      "h1",
      null,
      "Notifications ",
      rce(
        "span",
        {className: "notif-unread-number"},
        unreadNum
      )
    ),
    rce(
      "button",
      {
        type: "button",
        className: "text-btn",
        id: "mark-all-as-read",
        onClick: markAllAsRead
      },
      "Mark all as read"
    )
  );
}

class NotifMain extends React.Component {
  constructor(props){
    super(props);
    
    let w = "";
    let n = 0;
    
    if (httpReq.responseText !== ""){
      w = JSON.parse(httpReq.responseText).notifications;
      
      for (let i = 0; i < w.length; i++){
        if (w[i].isUnread) n++;
      }
    }
    
    this.state = {
      data: w,
      unreadNum: n
    }
  }
  
  markAllAsRead = () => {
    if (!this.state.data) return;
    
    let x = this.state.data.slice();
    for (let i = 0; i < x.length; i++){
      x[i].isUnread = false;
    }
    
    document.title = pageTitle; // Remove the number in parentheses
    
    this.setState({
      data: x,
      unreadNum: 0
    });
  }
  
  render(){
    const data = this.state.data;
    let notifArr = [];
    
    if (!data){
      notifArr.push(
        rce(
          "div",
          {className: "no-data"},
          "Something went wrong. Please ",
          rce("a", {href: ""}, "reload"),
          " the page."
        )
      );
    } else {
      for (let i = 0; i < data.length; i++){
        notifArr.push(
          Notif(data[i],i)
        );
      }
    }
    
    if (this.state.unreadNum){
      document.title = "(" + this.state.unreadNum + ") " + pageTitle;
    }
    
    return rce(
      React.Fragment,
      null,
      NotifHeader(
        this.state.unreadNum,
        this.markAllAsRead
      ),
      rce(
        "div",
        {className: "notif-body"},
        notifArr
      )
    );
  }
}

//----------------------------------------------------------------------//

const httpReq = new XMLHttpRequest();
httpReq.open("GET", "data.json");
httpReq.send();

const pageTitle = document.title;

const root = ReactDOM.createRoot(document.getElementById("notif-root"));

httpReq.addEventListener("loadend", e => {
  root.render(rce(NotifMain));
});

