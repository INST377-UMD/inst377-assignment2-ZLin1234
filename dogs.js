// Initialize variables for speech recognition
let recognition;
let isListening = false;

// Store all breed data
let allBreeds = [];

// Function to load random dog images for carousel
async function loadDogImages() {
    try {
        const carouselElement = document.getElementById('dogCarousel');
        carouselElement.innerHTML = ''; // Clear placeholder
        
        // Fetch 10 random dog images
        for (let i = 0; i < 10; i++) {
            const response = await fetch('https://dog.ceo/api/breeds/image/random');
            const data = await response.json();
            
            if (data.status === 'success') {
                const img = document.createElement('img');
                img.src = data.message;
                img.alt = 'Random dog image';
                carouselElement.appendChild(img);
            }
        }
        
        // Initialize carousel
        simpleslider.getSlider({
            container: document.getElementById('dogCarousel'),
            transitionTime: 1,
            delay: 3.5
        });
    } catch (error) {
        console.error('Error loading dog images:', error);
        document.getElementById('dogCarousel').innerHTML = '<p>Error loading images. Please refresh the page.</p>';
    }
}

// Function to load dog breeds and create buttons
async function loadDogBreeds() {
    try {
        // Use the correct API endpoint according to the documentation
        const response = await fetch('https://api.thedogapi.com/v1/breeds');
        const data = await response.json();
        
        if (data && Array.isArray(data)) {
            allBreeds = data;
            const breedButtonsContainer = document.getElementById('breedButtons');
            breedButtonsContainer.innerHTML = ''; // Clear loading text
            
            // Create a container for the first 10 breeds
            const mainBreedsContainer = document.createElement('div');
            mainBreedsContainer.className = 'main-breeds';
            breedButtonsContainer.appendChild(mainBreedsContainer);
            
            // Create a button for only the first 10 breeds
            const firstTenBreeds = data.slice(0, 10);
            
            firstTenBreeds.forEach(breed => {
                const button = document.createElement('button');
                button.className = 'breed-button';
                button.textContent = breed.name;
                button.setAttribute('data-breed-id', breed.id);
                button.addEventListener('click', () => showBreedInfo(breed.id));
                mainBreedsContainer.appendChild(button);
            });
            
            // Add a "Show more" button if there are more than 10 breeds
            if (data.length > 10) {
                const showMoreButton = document.createElement('button');
                showMoreButton.className = 'breed-button show-more';
                showMoreButton.textContent = 'Show More';
                showMoreButton.addEventListener('click', () => toggleAdditionalBreeds());
                breedButtonsContainer.appendChild(showMoreButton);
                
                // Create a container for additional breeds (initially hidden)
                const additionalBreedsContainer = document.createElement('div');
                additionalBreedsContainer.className = 'additional-breeds';
                additionalBreedsContainer.style.display = 'none';
                breedButtonsContainer.appendChild(additionalBreedsContainer);
                
                // Add the remaining breeds to this container
                data.slice(10).forEach(breed => {
                    const button = document.createElement('button');
                    button.className = 'breed-button';
                    button.textContent = breed.name;
                    button.setAttribute('data-breed-id', breed.id);
                    button.addEventListener('click', () => showBreedInfo(breed.id));
                    additionalBreedsContainer.appendChild(button);
                });
            }
            
            console.log(`Successfully loaded ${data.length} dog breeds`);
        } else {
            throw new Error('Invalid data format received from API');
        }
    } catch (error) {
        console.error('Error loading dog breeds:', error);
        document.getElementById('breedButtons').innerHTML = '<p>Error loading breeds. Please refresh the page.</p>';
    }
}

// Function to toggle visibility of additional breeds
function toggleAdditionalBreeds() {
    const additionalBreedsContainer = document.querySelector('.additional-breeds');
    const showMoreButton = document.querySelector('.show-more');
    
    if (additionalBreedsContainer.style.display === 'none') {
        additionalBreedsContainer.style.display = 'flex';
        showMoreButton.textContent = 'Show Less';
    } else {
        additionalBreedsContainer.style.display = 'none';
        showMoreButton.textContent = 'Show More';
    }
}

// Function to display breed information
function showBreedInfo(breedId) {
    const breedInfoContainer = document.getElementById('breedInfo');
    const breed = allBreeds.find(b => b.id === breedId);
    
    if (breed) {
        // The structure of the data is different with the new API
        const lifeSpan = breed.life_span || 'Unknown';
        // Extract min and max life span from format like "10 - 12 years"
        let minLife = 'N/A';
        let maxLife = 'N/A';
        
        if (lifeSpan && lifeSpan.includes('-')) {
            const lifeParts = lifeSpan.split('-');
            minLife = lifeParts[0].trim().replace(' years', '');
            maxLife = lifeParts[1].trim().replace(' years', '');
        }
        
        breedInfoContainer.innerHTML = `
            <h2>${breed.name}</h2>
            <p>${breed.temperament || 'No description available.'}</p>
            <p>Breed Group: ${breed.breed_group || 'Not specified'}</p>
            <div class="lifespan">
                <div>
                    <p>Minimum Life Expectancy</p>
                    <span>${minLife} years</span>
                </div>
                <div>
                    <p>Maximum Life Expectancy</p>
                    <span>${maxLife} years</span>
                </div>
            </div>
        `;
        
        breedInfoContainer.style.display = 'block';
        
        // Scroll to the info container
        breedInfoContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Initialize everything when the page loads
window.addEventListener('DOMContentLoaded', async () => {
    await loadDogImages();
    await loadDogBreeds();
    setupSpeechRecognition();
});



function loadBreedByName(breedName) {
    fetch(`https://api.thedogapi.com/v1/breeds/search?q=${breedName}`)
      .then(res => res.json())
      .then(data => {
        if (data.length > 0) {
          const breed = data[0];

          fetch(`https://api.thedogapi.com/v1/images/search?breed_id=${breed.id}`)
            .then(res => res.json())
            .then(imageData => {
              const detailedBreed = imageData[0]?.breeds[0];
  
              document.getElementById('breedInfo').style.display = 'block';
              document.getElementById('breed-name').textContent = detailedBreed.name;
              document.getElementById('breed-description').textContent = detailedBreed.temperament || "No temperament info available.";
              document.getElementById('breed-lifespan').textContent = detailedBreed.life_span || "Unknown";
  
           
              document.getElementById('breed-image').src = imageData[0]?.url || "";
              document.getElementById('breed-image').alt = detailedBreed.name;
            });
        } else {
          alert("Breed not found: " + breedName);
        }
      });
  }
  

function startListening() {
    if (annyang) {
      const commands = {
        "hello": () => alert("Hello to you too! 👋"),
  
        "change the color to *color": (color) => {
          document.body.style.backgroundColor = color;
        },
  
        "navigate to *page": (page) => {
          const target = page.toLowerCase().trim();
          if (target.includes("home")) {
            window.location.href = "A2.html";
          } else if (target.includes("dogs")) {
            window.location.href = "dogs.html";
          } else if (target.includes("stocks")) {
            window.location.href = "stocks.html";
          } else {
            alert("Page not found: " + page);
          }
        },
  
        "load dog breed *breed": (breed) => {
            const formatted = breed.toLowerCase().trim();
            loadBreedByName(formatted);
          }
          
      };
  
      annyang.addCommands(commands);
      annyang.start();
      console.log("🎤 Listening with Annyang...");
    }
  }
  
  function stopListening() {
    if (annyang) {
      annyang.abort();
      console.log("🛑 Stopped Listening");
    }
  }
  