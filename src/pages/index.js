// import { useState, useEffect } from 'react';

// const CameraUpload = () => {
//   const [images, setImages] = useState([]);
//   const [b_id, setBId] = useState('');
//   const [secretCode, setSecretCode] = useState('');
//   const [location, setLocation] = useState(null);

//   // Capture location when the component mounts
//   useEffect(() => {
//     if (navigator.geolocation) {
//       navigator.geolocation.getCurrentPosition(
//         (position) => {
//           setLocation({
//             latitude: position.coords.latitude,
//             longitude: position.coords.longitude,
//           });
//         },
//         (error) => {
//           console.error('Error getting location:', error);
//         }
//       );
//     } else {
//       console.error('Geolocation is not supported by this browser.');
//     }
//   }, []);

//   // Handle image capture
//   const handleImageCapture = (e) => {
//     const files = Array.from(e.target.files);
//     setImages(files);
//   };

//   // Handle form submission
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!images.length || !location || !b_id || !secretCode) {
//       alert('Please fill in all fields and capture an image.');
//       return;
//     }

//     const formData = new FormData();
//     images.forEach((file, index) => {
//       formData.append('images', file);
//     });
//     formData.append('b_id', b_id);
//     formData.append('secret_code', secretCode);
//     formData.append('location', JSON.stringify(location));
//     formData.append('timestamp', new Date().toISOString());
    

//     try {
//       const response = await fetch('/api/upload', {
//         method: 'POST',
//         body: formData,
//       });

//       const data = await response.json();
//       if (response.ok) {
//         alert('Images uploaded and email sent successfully!');
//       } else {
//         alert('Error: ' + data.message);
//       }
//     } catch (error) {
//       console.error('Error uploading images:', error);
//       alert('Error uploading images.');
//     }
//   };

//   return (
//     <div style ={{background: '#e6e6e6', padding:'50px 50px 100% 50px'}} className="container">
//        <header style={{display: 'flex', justifyContent: 'center' }}>
//         <img width='100px' src="/logo.jpeg" alt="Logo" className="logo" />
//       </header>
//       <form style = {{marginLeft: '-20px'}} onSubmit={handleSubmit}>
//         <div>
//           <label>BC ID:</label>
//           <input type="text" value={b_id} onChange={(e) => setBId(e.target.value)} required />
//         </div>
//         <div>
//           <label>Secret code:</label>
//           <input type="password" value={secretCode} onChange={(e) => setSecretCode(e.target.value)} required />
//         </div>
//         <div>
//           <label>Upload images:</label>
//           <input type="file" accept="image/*" multiple capture="environment" onChange={handleImageCapture} required />
//         </div>
//         <button style ={{ marginLeft: '3%'}} type="submit">Submit</button>
//       </form>
//     </div>
//   );
// };

// export default CameraUpload;


export default function handler(req, res) {
  if (req.method === 'POST') {
    console.log('Received POST request');
    res.status(200).json({ message: 'POST request received' });
  } else {
    console.log('Received GET request');
    res.status(200).json({ message: 'GET request received' });
  }
}