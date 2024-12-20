import Table, { ColumnsType } from "antd/es/table"
import CreateUserModal from "../components/CreateUserModal"
import { IUserWithAgendaIds } from "@core"
import { Button, Space } from "antd"
import { Link } from "react-router-dom"
import { useDispatch, useSelector } from "../../../../redux/hooks"
import { loadUsers, usersSelectors } from "../reducer"
import { useCallback, useEffect, useState } from "react"
const columns: ColumnsType<IUserWithAgendaIds> = [{
  title: "Alias",
  dataIndex: "alias",
  key: "alias"
}, {
  title: "Passcode",
  dataIndex: "passcode",
  key: "passcode"
},{
  title: "Actions",
  key: "action",
  render: (_, user) => {
    return <Space key="action" size="middle">
      <Link to={`/admin/users/${user._id}`}>
        <Button>Detail</Button>
      </Link>
    </Space>
  }
}]

export const UserListPage = () => {

  const dispatch = useDispatch()
  const users = useSelector(usersSelectors.selectAll)
  const [isCreationModalOpen, setIsCreationModalOpen] = useState<boolean>(false)

  const onCreateDyadClick = useCallback(()=>{
    setIsCreationModalOpen(true)
}, [])


const closeCreateDyadModal = useCallback(()=>{
    setIsCreationModalOpen(false)
}, [])

useEffect(()=>{
    dispatch(loadUsers())
}, [])

  return (
    <div className='container mx-auto px-10 py-10 flex flex-col'>
        <div className="text-lg font-bold mb-3 ml-1">Users</div>
        <Table dataSource={users} columns={columns}/>
        <Button className="self-start" onClick={onCreateDyadClick}>Create User</Button>
        <CreateUserModal open={isCreationModalOpen} onClose={closeCreateDyadModal}/>
    </div>
  )
}