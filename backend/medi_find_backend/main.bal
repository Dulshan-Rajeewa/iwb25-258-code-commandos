import ballerina/http;
import ballerina/io;
import ballerina/time;

// ---------------- Data Types ----------------
type Medicine record {
    string id;
    string name;
    string description;
    string category;
    decimal price;
    int stockQuantity;
    string pharmacyId;
    string pharmacyName;
    string location;
    string imageUrl;
    boolean isAvailable;
};

type Pharmacy record {
    string id;
    string name;
    string email;
    string password?; // Optional for backward compatibility
    string phone;
    string license;
    string address;
    string city;
    string province;
    string country;
    decimal latitude;
    decimal longitude;
    string imageUrl;
    boolean isVerified;
};

type User record {
    string id;
    string email;
    string password?; // Optional for backward compatibility
    string name;
    string phone;
    string location;
    decimal latitude;
    decimal longitude;
};

type SearchRequest record {
    string medicineName;
    string location;
    decimal? latitude;
    decimal? longitude;
    int? radius;
};

type SearchResponse record {
    Medicine[] medicines;
    int totalCount;
    string message;
};

type AuthRequest record {
    string email;
    string password;
};

type AuthResponse record {
    string token;
    string userId;
    string userType;
    string message;
    boolean success;
};

type RegisterRequest record {
    string name;
    string email;
    string password;
    string phone;
    string? license;
    string? address;
    string? city;
    string? province;
    string? country;
};

// ---------------- Globals ----------------
final Medicine[] medicines = [];
final Pharmacy[] pharmacies = [];
final User[] users = [];
final map<string> sessions = {};

string JWT_SECRET = "your-secret-key-here";

// ---------------- Listener ----------------
listener http:Listener httpListener = new (9090);

// ---------------- Service ----------------

// Root service for basic info
service / on httpListener {
    resource function get .() returns json {
        return {
            name: "MediFind Backend API",
            version: "1.0.0",
            status: "running",
            endpoints: {
                health: "/api/v1/health",
                search: "/api/v1/search",
                medicines: "/api/v1/medicines",
                pharmacies: "/api/v1/pharmacies"
            }
        };
    }
}

@http:ServiceConfig {
    cors: {
        allowOrigins: ["*"],
        allowCredentials: false,
        allowHeaders: ["Content-Type", "Authorization"],
        allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    }
}
service /api/v1 on httpListener {

    // Health check
    resource function get health() returns json {
        return {
            status: "healthy",
            timestamp: time:utcNow().toString(),
            "service": "MediFind Backend"
        };
    }

    // CORS preflight handler
    resource function options .(http:Caller caller, http:Request req) returns error? {
        http:Response response = new;
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        response.setHeader("Access-Control-Max-Age", "86400");
        return caller->respond(response);
    }

    // CORS preflight handler for medicine-specific paths
    resource function options medicines/[string id](http:Caller caller, http:Request req) returns error? {
        http:Response response = new;
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        response.setHeader("Access-Control-Max-Age", "86400");
        return caller->respond(response);
    }

    // CORS preflight handler for medicines base path
    resource function options medicines(http:Caller caller, http:Request req) returns error? {
        http:Response response = new;
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        response.setHeader("Access-Control-Max-Age", "86400");
        return caller->respond(response);
    }

    // CORS preflight handler for pharmacyInfo path
    resource function options pharmacyInfo(http:Caller caller, http:Request req) returns error? {
        http:Response response = new;
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        response.setHeader("Access-Control-Max-Age", "86400");
        return caller->respond(response);
    }

    // Medicine search
    resource function post search(http:Caller caller, http:Request req) returns error? {
        json|error payload = req.getJsonPayload();
        if payload is error {
            return caller->respond({message: "Invalid JSON"});
        }
        
        // Extract fields safely from JSON
        if payload is map<json> {
            string medicineName = payload["medicineName"] is string ? <string>payload["medicineName"] : "";
            string location = payload["location"] is string ? <string>payload["location"] : "";
            
            string searchTerm = medicineName.toLowerAscii();
            Medicine[] results = [];
            foreach var medicine in medicines {
                if medicine.name.toLowerAscii().includes(searchTerm) ||
                   medicine.description.toLowerAscii().includes(searchTerm) {
                    results.push(medicine);
                }
            }
            SearchResponse response = {
                medicines: results,
                totalCount: results.length(),
                message: "Search completed successfully"
            };
            return caller->respond(response);
        } else {
            return caller->respond({message: "Invalid JSON format"});
        }
    }

    // Get all medicines
    resource function get medicines(http:Caller caller) returns error? {
        return caller->respond({medicines: medicines, totalCount: medicines.length()});
    }

    // Add medicine
    resource function post medicines(http:Caller caller, http:Request req) returns error? {
        // Check authentication
        var tokenResult = req.getHeader("Authorization");
        if tokenResult is string && tokenResult.startsWith("Bearer ") {
            string actualToken = tokenResult.substring(7);
            string? userId = sessions[actualToken];
            if userId is () {
                return caller->respond({message: "Unauthorized", success: false});
            }
            
            // Find the pharmacy that owns this session
            Pharmacy? currentPharmacy = ();
            foreach var pharmacy in pharmacies {
                if pharmacy.id == userId {
                    currentPharmacy = pharmacy;
                    break;
                }
            }
            
            if currentPharmacy is () {
                return caller->respond({message: "Pharmacy not found", success: false});
            }
            
            json|error payload = req.getJsonPayload();
            if payload is error {
                return caller->respond({message: "Invalid JSON", success: false});
            }
            
            // Extract fields safely from JSON
            if payload is map<json> {
                string name = payload["name"] is string ? <string>payload["name"] : "";
                string description = payload["description"] is string ? <string>payload["description"] : "";
                string category = payload["category"] is string ? <string>payload["category"] : "";
                
                // Handle price - could come as int, float, or decimal
                decimal price = 0.0;
                if payload["price"] is int {
                    price = <decimal><int>payload["price"];
                } else if payload["price"] is float {
                    price = <decimal><float>payload["price"];
                } else if payload["price"] is decimal {
                    price = <decimal>payload["price"];
                }
                
                // Handle stockQuantity - could come as int or float
                int stockQuantity = 0;
                if payload["stockQuantity"] is int {
                    stockQuantity = <int>payload["stockQuantity"];
                } else if payload["stockQuantity"] is float {
                    stockQuantity = <int><float>payload["stockQuantity"];
                }
                
                string imageUrl = payload["imageUrl"] is string ? <string>payload["imageUrl"] : "";
                
                Medicine newMedicine = {
                    id: generateId(),
                    name: name,
                    description: description,
                    category: category,
                    price: price,
                    stockQuantity: stockQuantity,
                    pharmacyId: currentPharmacy.id,
                    pharmacyName: currentPharmacy.name,
                    location: currentPharmacy.city + ", " + currentPharmacy.province,
                    imageUrl: imageUrl,
                    isAvailable: stockQuantity > 0
                };
                
                medicines.push(newMedicine);
                return caller->respond({
                    message: "Medicine added successfully", 
                    medicine: newMedicine,
                    success: true
                });
            } else {
                return caller->respond({message: "Invalid JSON format", success: false});
            }
        } else {
            return caller->respond({message: "Authorization header required", success: false});
        }
    }

    // Update medicine
    resource function put medicines/[string id](http:Caller caller, http:Request req) returns error? {
        // Check authentication
        var tokenResult = req.getHeader("Authorization");
        if tokenResult is string && tokenResult.startsWith("Bearer ") {
            string actualToken = tokenResult.substring(7);
            string? userId = sessions[actualToken];
            if userId is () {
                return caller->respond({message: "Unauthorized", success: false});
            }
            
            // Find the pharmacy that owns this session
            Pharmacy? currentPharmacy = ();
            foreach var pharmacy in pharmacies {
                if pharmacy.id == userId {
                    currentPharmacy = pharmacy;
                    break;
                }
            }
            
            if currentPharmacy is () {
                return caller->respond({message: "Pharmacy not found", success: false});
            }
            
            json|error payload = req.getJsonPayload();
            if payload is error {
                return caller->respond({message: "Invalid JSON", success: false});
            }
            
            // Find the medicine to update
            foreach int i in 0 ..< medicines.length() {
                if medicines[i].id == id {
                    // Check if this pharmacy owns this medicine
                    if medicines[i].pharmacyId != currentPharmacy.id {
                        return caller->respond({message: "Unauthorized: You can only edit your own medicines", success: false});
                    }
                    
                    // Extract fields safely from JSON
                    if payload is map<json> {
                        string name = payload["name"] is string ? <string>payload["name"] : medicines[i].name;
                        string description = payload["description"] is string ? <string>payload["description"] : medicines[i].description;
                        string category = payload["category"] is string ? <string>payload["category"] : medicines[i].category;
                        
                        // Handle price - could come as int, float, or decimal
                        decimal price = medicines[i].price;
                        if payload["price"] is int {
                            price = <decimal><int>payload["price"];
                        } else if payload["price"] is float {
                            price = <decimal><float>payload["price"];
                        } else if payload["price"] is decimal {
                            price = <decimal>payload["price"];
                        }
                        
                        // Handle stockQuantity - could come as int or float
                        int stockQuantity = medicines[i].stockQuantity;
                        if payload["stockQuantity"] is int {
                            stockQuantity = <int>payload["stockQuantity"];
                        } else if payload["stockQuantity"] is float {
                            stockQuantity = <int><float>payload["stockQuantity"];
                        }
                        
                        string imageUrl = payload["imageUrl"] is string ? <string>payload["imageUrl"] : medicines[i].imageUrl;
                        
                        Medicine updatedMedicine = {
                            id: id,
                            name: name,
                            description: description,
                            category: category,
                            price: price,
                            stockQuantity: stockQuantity,
                            pharmacyId: currentPharmacy.id,
                            pharmacyName: currentPharmacy.name,
                            location: currentPharmacy.city + ", " + currentPharmacy.province,
                            imageUrl: imageUrl,
                            isAvailable: stockQuantity > 0
                        };
                        
                        medicines[i] = updatedMedicine;
                        return caller->respond({
                            message: "Medicine updated successfully", 
                            medicine: updatedMedicine,
                            success: true
                        });
                    } else {
                        return caller->respond({message: "Invalid JSON format", success: false});
                    }
                }
            }
            return caller->respond({message: "Medicine not found", success: false});
        } else {
            return caller->respond({message: "Authorization header required", success: false});
        }
    }

    // Delete medicine
    resource function delete medicines/[string id](http:Caller caller, http:Request req) returns error? {
        // Check authentication
        var tokenResult = req.getHeader("Authorization");
        if tokenResult is string && tokenResult.startsWith("Bearer ") {
            string actualToken = tokenResult.substring(7);
            string? userId = sessions[actualToken];
            if userId is () {
                return caller->respond({message: "Unauthorized", success: false});
            }
            
            // Find the pharmacy that owns this session
            Pharmacy? currentPharmacy = ();
            foreach var pharmacy in pharmacies {
                if pharmacy.id == userId {
                    currentPharmacy = pharmacy;
                    break;
                }
            }
            
            if currentPharmacy is () {
                return caller->respond({message: "Pharmacy not found", success: false});
            }
            
            // Find and delete the medicine
            foreach int i in 0 ..< medicines.length() {
                if medicines[i].id == id {
                    // Check if this pharmacy owns this medicine
                    if medicines[i].pharmacyId != currentPharmacy.id {
                        return caller->respond({message: "Unauthorized: You can only delete your own medicines", success: false});
                    }
                    
                    _ = medicines.remove(i);
                    return caller->respond({message: "Medicine deleted successfully", success: true});
                }
            }
            return caller->respond({message: "Medicine not found", success: false});
        } else {
            return caller->respond({message: "Authorization header required", success: false});
        }
    }

    // Pharmacy login
    resource function post pharmacyLogin(http:Caller caller, http:Request req) returns error? {
        json|error payload = req.getJsonPayload();
        if payload is error {
            return caller->respond({message: "Invalid JSON"});
        }
        
        // Extract fields safely from JSON
        if payload is map<json> {
            string email = payload["email"] is string ? <string>payload["email"] : "";
            string password = payload["password"] is string ? <string>payload["password"] : "";
            
            Pharmacy? foundPharmacy = ();
            foreach var pharmacy in pharmacies {
                if pharmacy.email == email {
                    foundPharmacy = pharmacy;
                    break;
                }
            }
            if foundPharmacy is Pharmacy {
                // For existing pharmacies without password or for demo purposes, accept any password
                // In production, you'd want to hash and compare passwords properly
                if (foundPharmacy.password is () || foundPharmacy.password == password || password == "demo123") {
                    string token = generateJWT(foundPharmacy.id, "pharmacy");
                    sessions[token] = foundPharmacy.id;
                    return caller->respond({
                        token: token,
                        userId: foundPharmacy.id,
                        userType: "pharmacy",
                        message: "Login successful",
                        success: true
                    });
                } else {
                    return caller->respond({message: "Invalid password", success: false});
                }
            }
            return caller->respond({message: "Pharmacy not found", success: false});
        } else {
            return caller->respond({message: "Invalid JSON format", success: false});
        }
    }

    // Pharmacy register
    resource function post pharmacyRegister(http:Caller caller, http:Request req) returns error? {
        json|error payload = req.getJsonPayload();
        if payload is error {
            return caller->respond({message: "Invalid JSON"});
        }
        
        // Extract fields safely from JSON
        if payload is map<json> {
            string name = payload["name"] is string ? <string>payload["name"] : "";
            string email = payload["email"] is string ? <string>payload["email"] : "";
            string password = payload["password"] is string ? <string>payload["password"] : "";
            string phone = payload["phone"] is string ? <string>payload["phone"] : "";
            string license = payload["license"] is string ? <string>payload["license"] : "";
            string address = payload["address"] is string ? <string>payload["address"] : "";
            string city = payload["city"] is string ? <string>payload["city"] : "";
            string province = payload["province"] is string ? <string>payload["province"] : "";
            string country = payload["country"] is string ? <string>payload["country"] : "";
            
            // Check if pharmacy already exists
            foreach var pharmacy in pharmacies {
                if pharmacy.email == email {
                    return caller->respond({message: "Pharmacy with this email already exists", success: false});
                }
            }
            
            Pharmacy newPharmacy = {
                id: generateId(),
                name: name,
                email: email,
                password: password, // Store the password
                phone: phone,
                license: license,
                address: address,
                city: city,
                province: province,
                country: country,
                latitude: 0.0,
                longitude: 0.0,
                imageUrl: "",
                isVerified: false
            };
            pharmacies.push(newPharmacy);
            string token = generateJWT(newPharmacy.id, "pharmacy");
            sessions[token] = newPharmacy.id;
            return caller->respond({
                token: token,
                userId: newPharmacy.id,
                userType: "pharmacy",
                message: "Registration successful",
                success: true
            });
        } else {
            return caller->respond({message: "Invalid JSON format", success: false});
        }
    }

    // User login
    resource function post userLogin(http:Caller caller, http:Request req) returns error? {
        json|error payload = req.getJsonPayload();
        if payload is error {
            return caller->respond({message: "Invalid JSON"});
        }
        
        // Extract fields safely from JSON
        if payload is map<json> {
            string email = payload["email"] is string ? <string>payload["email"] : "";
            string password = payload["password"] is string ? <string>payload["password"] : "";
            
            User? foundUser = ();
            foreach var user in users {
                if user.email == email {
                    foundUser = user;
                    break;
                }
            }
            if foundUser is User {
                // For existing users without password or for demo purposes, accept any password
                // In production, you'd want to hash and compare passwords properly
                if (foundUser.password is () || foundUser.password == password || password == "demo123") {
                    string token = generateJWT(foundUser.id, "user");
                    sessions[token] = foundUser.id;
                    return caller->respond({
                        token: token,
                        userId: foundUser.id,
                        userType: "user",
                        message: "Login successful",
                        success: true
                    });
                } else {
                    return caller->respond({message: "Invalid password", success: false});
                }
            }
            return caller->respond({message: "User not found", success: false});
        } else {
            return caller->respond({message: "Invalid JSON format", success: false});
        }
    }

    // Generic auth endpoints for compatibility
    resource function post auth/login(http:Caller caller, http:Request req) returns error? {
        // Forward to pharmacy login for now (could be enhanced to detect user type)
        json|error payload = req.getJsonPayload();
        if payload is error {
            return caller->respond({message: "Invalid JSON"});
        }
        
        // Extract fields safely from JSON
        if payload is map<json> {
            string email = payload["email"] is string ? <string>payload["email"] : "";
            string password = payload["password"] is string ? <string>payload["password"] : "";
            
            Pharmacy? foundPharmacy = ();
            foreach var pharmacy in pharmacies {
                if pharmacy.email == email {
                    foundPharmacy = pharmacy;
                    break;
                }
            }
            if foundPharmacy is Pharmacy {
                // For existing pharmacies without password or for demo purposes, accept any password
                // In production, you'd want to hash and compare passwords properly
                if (foundPharmacy.password is () || foundPharmacy.password == password || password == "demo123") {
                    string token = generateJWT(foundPharmacy.id, "pharmacy");
                    sessions[token] = foundPharmacy.id;
                    return caller->respond({
                        token: token,
                        userId: foundPharmacy.id,
                        userType: "pharmacy",
                        message: "Login successful",
                        success: true
                    });
                } else {
                    return caller->respond({message: "Invalid password", success: false});
                }
            }
            return caller->respond({message: "Pharmacy not found", success: false});
        } else {
            return caller->respond({message: "Invalid JSON format", success: false});
        }
    }

    // User register
    resource function post userRegister(http:Caller caller, http:Request req) returns error? {
        json|error payload = req.getJsonPayload();
        if payload is error {
            return caller->respond({message: "Invalid JSON"});
        }
        
        // Extract fields safely from JSON
        if payload is map<json> {
            string name = payload["name"] is string ? <string>payload["name"] : "";
            string email = payload["email"] is string ? <string>payload["email"] : "";
            string password = payload["password"] is string ? <string>payload["password"] : "";
            string phone = payload["phone"] is string ? <string>payload["phone"] : "";
            
            // Check if user already exists
            foreach var user in users {
                if user.email == email {
                    return caller->respond({message: "User with this email already exists", success: false});
                }
            }
            
            User newUser = {
                id: generateId(),
                name: name,
                email: email,
                password: password, // Store the password
                phone: phone,
                location: "",
                latitude: 0.0,
                longitude: 0.0
            };
            users.push(newUser);
            string token = generateJWT(newUser.id, "user");
            sessions[token] = newUser.id;
            return caller->respond({
                token: token,
                userId: newUser.id,
                userType: "user",
                message: "Registration successful",
                success: true
            });
        } else {
            return caller->respond({message: "Invalid JSON format", success: false});
        }
    }

    // Get all pharmacies
    resource function get pharmacies(http:Caller caller) returns error? {
        return caller->respond({pharmacies: pharmacies, totalCount: pharmacies.length()});
    }

    // Get pharmacy by ID
    resource function get pharmacy(http:Caller caller, string id) returns error? {
        foreach var pharmacy in pharmacies {
            if pharmacy.id == id {
                return caller->respond(pharmacy);
            }
        }
        return caller->respond({message: "Pharmacy not found"});
    }

    // Get medicines by pharmacy ID
    resource function get pharmacyMedicines(http:Caller caller, string id) returns error? {
        Medicine[] pharmacyMedicines = [];
        foreach var medicine in medicines {
            if medicine.pharmacyId == id {
                pharmacyMedicines.push(medicine);
            }
        }
        return caller->respond({medicines: pharmacyMedicines, totalCount: pharmacyMedicines.length()});
    }

    // Get current pharmacy info (authenticated)
    resource function get pharmacyInfo(http:Caller caller, http:Request req) returns error? {
        // Check authentication
        var tokenResult = req.getHeader("Authorization");
        if tokenResult is string && tokenResult.startsWith("Bearer ") {
            string actualToken = tokenResult.substring(7);
            string? userId = sessions[actualToken];
            if userId is () {
                return caller->respond({message: "Invalid or expired token", success: false});
            }
            
            // Find the pharmacy that owns this session
            Pharmacy? currentPharmacy = ();
            foreach var pharmacy in pharmacies {
                if pharmacy.id == userId {
                    currentPharmacy = pharmacy;
                    break;
                }
            }
            
            if currentPharmacy is () {
                return caller->respond({message: "Pharmacy not found", success: false});
            }
            
            // Return pharmacy info without password
            Pharmacy responsePharmacy = {
                id: currentPharmacy.id,
                name: currentPharmacy.name,
                email: currentPharmacy.email,
                phone: currentPharmacy.phone,
                license: currentPharmacy.license,
                address: currentPharmacy.address,
                city: currentPharmacy.city,
                province: currentPharmacy.province,
                country: currentPharmacy.country,
                latitude: currentPharmacy.latitude,
                longitude: currentPharmacy.longitude,
                imageUrl: currentPharmacy.imageUrl,
                isVerified: currentPharmacy.isVerified
            };
            
            return caller->respond({pharmacy: responsePharmacy, success: true});
        } else {
            return caller->respond({message: "Authorization header required", success: false});
        }
    }

    // Update current pharmacy info (authenticated)
    resource function put pharmacyInfo(http:Caller caller, http:Request req) returns error? {
        // Check authentication
        var tokenResult = req.getHeader("Authorization");
        if tokenResult is string && tokenResult.startsWith("Bearer ") {
            string actualToken = tokenResult.substring(7);
            string? userId = sessions[actualToken];
            if userId is () {
                return caller->respond({message: "Invalid or expired token", success: false});
            }
            
            // Find the pharmacy that owns this session
            Pharmacy? currentPharmacy = ();
            int pharmacyIndex = -1;
            foreach int i in 0 ..< pharmacies.length() {
                if pharmacies[i].id == userId {
                    currentPharmacy = pharmacies[i];
                    pharmacyIndex = i;
                    break;
                }
            }
            
            if currentPharmacy is () {
                return caller->respond({message: "Pharmacy not found", success: false});
            }
            
            json|error payload = req.getJsonPayload();
            if payload is error {
                return caller->respond({message: "Invalid JSON", success: false});
            }
            
            // Extract fields safely from JSON
            if payload is map<json> {
                string name = payload["name"] is string ? <string>payload["name"] : currentPharmacy.name;
                string email = payload["email"] is string ? <string>payload["email"] : currentPharmacy.email;
                string phone = payload["phone"] is string ? <string>payload["phone"] : currentPharmacy.phone;
                string address = payload["address"] is string ? <string>payload["address"] : currentPharmacy.address;
                string city = payload["city"] is string ? <string>payload["city"] : currentPharmacy.city;
                string province = payload["province"] is string ? <string>payload["province"] : currentPharmacy.province;
                string country = payload["country"] is string ? <string>payload["country"] : currentPharmacy.country;
                string imageUrl = payload["imageUrl"] is string ? <string>payload["imageUrl"] : currentPharmacy.imageUrl;
                string description = payload["description"] is string ? <string>payload["description"] : "";
                
                // Update the pharmacy
                Pharmacy updatedPharmacy = {
                    id: currentPharmacy.id,
                    name: name,
                    email: email,
                    password: currentPharmacy.password,
                    phone: phone,
                    license: currentPharmacy.license,
                    address: address,
                    city: city,
                    province: province,
                    country: country,
                    latitude: currentPharmacy.latitude,
                    longitude: currentPharmacy.longitude,
                    imageUrl: imageUrl,
                    isVerified: currentPharmacy.isVerified
                };
                
                pharmacies[pharmacyIndex] = updatedPharmacy;
                
                // Return success response
                return caller->respond({
                    message: "Pharmacy information updated successfully",
                    success: true,
                    pharmacy: {
                        id: updatedPharmacy.id,
                        name: updatedPharmacy.name,
                        email: updatedPharmacy.email,
                        phone: updatedPharmacy.phone,
                        license: updatedPharmacy.license,
                        address: updatedPharmacy.address,
                        city: updatedPharmacy.city,
                        province: updatedPharmacy.province,
                        country: updatedPharmacy.country,
                        latitude: updatedPharmacy.latitude,
                        longitude: updatedPharmacy.longitude,
                        imageUrl: updatedPharmacy.imageUrl,
                        isVerified: updatedPharmacy.isVerified
                    }
                });
            } else {
                return caller->respond({message: "Invalid JSON format", success: false});
            }
        } else {
            return caller->respond({message: "Authorization header required", success: false});
        }
    }

    // Logout
    resource function post logout(http:Caller caller, http:Request req) returns error? {
        var tokenResult = req.getHeader("Authorization");
        if tokenResult is string && tokenResult.startsWith("Bearer ") {
            string actualToken = tokenResult.substring(7);
            _ = sessions.remove(actualToken);
        }
        return caller->respond({message: "Logged out successfully"});
    }
}

// ---------------- Helper Functions ----------------
function generateId() returns string {
    return "id_" + time:utcNow().toString();
}

function generateJWT(string userId, string userType) returns string {
    string header = "{\"alg\":\"HS256\",\"typ\":\"JWT\"}";
    string payload = "{\"sub\":\"" + userId + "\",\"type\":\"" + userType + "\",\"iat\":\"" + time:utcNow().toString() + "\"}";
    return header + "." + payload + ".signature";
}

function initializeSampleData() {
    pharmacies.push({
        id: "pharm_001",
        name: "City Pharmacy",
        email: "city@pharmacy.com",
        password: "demo123",
        phone: "+1234567890",
        license: "PH123456",
        address: "123 Main St",
        city: "New York",
        province: "NY",
        country: "USA",
        latitude: 40.7128,
        longitude: -74.0060,
        imageUrl: "https://example.com/pharmacy1.jpg",
        isVerified: true
    });
    pharmacies.push({
        id: "pharm_002",
        name: "Health Plus Pharmacy",
        email: "health@pharmacy.com",
        password: "demo123",
        phone: "+1234567891",
        license: "PH123457",
        address: "456 Oak Ave",
        city: "Los Angeles",
        province: "CA",
        country: "USA",
        latitude: 34.0522,
        longitude: -118.2437,
        imageUrl: "https://example.com/pharmacy2.jpg",
        isVerified: true
    });
    medicines.push({
        id: "med_001",
        name: "Paracetamol",
        description: "Pain reliever and fever reducer",
        category: "Pain Relief",
        price: 5.99,
        stockQuantity: 100,
        pharmacyId: "pharm_001",
        pharmacyName: "City Pharmacy",
        location: "New York, NY",
        imageUrl: "https://example.com/paracetamol.jpg",
        isAvailable: true
    });
    medicines.push({
        id: "med_002",
        name: "Aspirin",
        description: "Pain reliever and blood thinner",
        category: "Pain Relief",
        price: 3.99,
        stockQuantity: 75,
        pharmacyId: "pharm_001",
        pharmacyName: "City Pharmacy",
        location: "New York, NY",
        imageUrl: "https://example.com/aspirin.jpg",
        isAvailable: true
    });
    medicines.push({
        id: "med_003",
        name: "Ibuprofen",
        description: "Anti-inflammatory pain reliever",
        category: "Pain Relief",
        price: 4.99,
        stockQuantity: 50,
        pharmacyId: "pharm_002",
        pharmacyName: "Health Plus Pharmacy",
        location: "Los Angeles, CA",
        imageUrl: "https://example.com/ibuprofen.jpg",
        isAvailable: true
    });
    users.push({
        id: "user_001",
        name: "John Doe",
        email: "john@example.com",
        password: "demo123",
        phone: "+1234567892",
        location: "New York, NY",
        latitude: 40.7128,
        longitude: -74.0060
    });
}

public function main() {
    initializeSampleData();
    io:println("MediFind Backend started on port 9090");
    io:println("Sample data loaded successfully");
}
