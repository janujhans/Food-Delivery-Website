import React, { useState } from 'react'
import './Home.css'
import Header from '../../components/Header/Header'
import SearchBar from '../../components/SearchBar/SearchBar'
import ExploreMenu from '../../components/ExploreMenu/ExploreMenu'
import FoodDisplay from '../../components/FoodDisplay/FoodDisplay'
import AppDownload from '../../components/AppDownload/AppDownload'

const Home = () => {

  const [category, setCategory] = useState('All')
  return (
    <div>
      <Header/>
      <div className="home-search-container">
        <SearchBar/>
      </div>
      <ExploreMenu category={category} setCategory={setCategory}/>
      <FoodDisplay category={category}/>
      <AppDownload/>
    </div>
  )
}

export default Home