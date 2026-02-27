import React, { useState } from 'react'
import Navbar from './components/Navbar/Navbar'
import {Route, Routes} from 'react-router-dom'
import Home from './pages/Home/Home'
import Cart from './pages/Cart/Cart'
import PlaceOrder from './pages/PlaceOrder/PlaceOrder'
import Footer from './components/Footer/Footer'
import LoginPopup from './components/LoginPopup/LoginPopup'
import Verify from './pages/Verify/Verify'
import MyOrders from './pages/MyOrders/MyOrders'
import AiAssistant from './components/AiAssistant/AiAssistant'
import PrivateRoute from './components/PrivateRoute/PrivateRoute'
import { StoreContext } from './components/context/StoreContext'

const App = () => {

  const [showLogin, setShowLogin] = useState(false);
  const { token } = React.useContext(StoreContext);

  return (
    <>
    {showLogin? <LoginPopup setShowLogin={setShowLogin}/>:<></>}
    <div className='app'>
      <Navbar setShowLogin={setShowLogin}/>
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/cart' element={<Cart/>}/>
        <Route path='/order' element={<PrivateRoute token={token}><PlaceOrder/></PrivateRoute>}/>
        <Route path='/verify' element={<PrivateRoute token={token}><Verify/></PrivateRoute>}/>
        <Route path='/myorders' element={<PrivateRoute token={token}><MyOrders/></PrivateRoute>}/>
      </Routes>
    </div>
    <Footer/>
    <AiAssistant />
    </>
  )
}

export default App