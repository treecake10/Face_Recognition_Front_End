import React, { Component } from 'react';
import ParticlesBg from 'particles-bg'
import Navigation from './Components/Navigation/Navigation';
import ImageLinkForm from './Components/ImageLinkForm/ImageLinkForm';
import Rank from './Components/Rank/Rank';
import FaceRecognition from './Components/FaceRecognition/FaceRecognition';
import SignIn from './Components/Signin/Signin';
import Register from './Components/Register/Register';
import './App.css';


const initialState = {
  input: '',
  imageUrl: '',
  box: {},
  route: 'sign_in',
  signed_In: false,
  user: {
    id: '',
    name: '',
    email: '',
    entries: 0,
    joined: '' 
  }

}

class App extends Component {

  constructor() {
    super();
    this.state = initialState;
  }

  loadUser = (data) => {
    this.setState({user: {
      id: data.id,
      name: data.name,
      email: data.email,
      entries: data.entries,
      joined: data.joined
    }})
  }

  calculateFacelocation = (data) => {

    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputImage');
    const width = Number(image.width);
    const height = Number(image.height);

    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - (clarifaiFace.right_col * width),
      bottomRow: height - (clarifaiFace.bottom_row * height)
    }

  }

  displayFaceBox = (box) => {
    console.log(box);
    this.setState({box: box});
  }

  onInputChange = (event) => {
     this.setState({input: event.target.value});
  }

  onButtonSubmit = async (event) => {

    try {

      this.setState({ imageUrl: this.state.input });

      const responseImageUrl = await fetch('https://smart-brain-node-express-app.onrender.com/imageurl', {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: this.state.input,
        }),
      });

      const imageUrlData = await responseImageUrl.json();

      if (imageUrlData) {
        
        const responseImage = await fetch('https://smart-brain-node-express-app.onrender.com/image', {
          method: 'put',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: this.state.user.id,
          }),
        });

        const count = await responseImage.json();

        this.setState(Object.assign(this.state.user, { entries: count }));
      }

      this.displayFaceBox(this.calculateFacelocation(imageUrlData));

    } catch (error) {
      console.error('Error:', error);
    }

  };

  onRouteChange = (route) => {
    if(route === 'sign_out') {
      this.setState(initialState)
    } else if (route === 'home') {
      this.setState({signed_In: true})

    }
    this.setState({route: route});
  }

  render() {

    const { signed_In, imageUrl, route, box } = this.state;
    
    return (
      <div className="App">
          <ParticlesBg type="circle" bg={true} />
          <Navigation signed_In={signed_In} onRouteChange={this.onRouteChange}/>
          { route === 'home' 
            ? <div>
                <Rank
                  name={this.state.user.name}
                  entries={this.state.user.entries}

                />
                <ImageLinkForm 
                   onInputChange={this.onInputChange}
                   onButtonSubmit={this.onButtonSubmit}
                />
                <FaceRecognition 
                   box={box} 
                   imageUrl={imageUrl} 
                />
              </div>
            : (
                this.state.route === 'sign_in'
                ? <SignIn loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
                : <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
              )
          }
      </div>
    );
  }
}

export default App;

