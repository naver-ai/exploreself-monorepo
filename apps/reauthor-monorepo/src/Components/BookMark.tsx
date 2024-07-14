const BookMarkItem = (props:{
  content: string
}) => {
  return(
    <div>
      {props.content}
      <button>Activate</button>
      <button>Delete</button>
    </div>
  )
}

const BookMark = (props:{
  bookmarks: Array<string>
}) => {
  return(
    <div>
      {props.bookmarks.map((bookmark, index) => {
        return <BookMarkItem content={bookmark}/>
      })}
    </div>
  )
}
export default BookMark;