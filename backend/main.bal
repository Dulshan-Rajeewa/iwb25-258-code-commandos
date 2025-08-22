import ballerina/http;
import ballerina/log;
import ballerina/uuid;
import ballerina/time;
import ballerina/regex;

configurable string supabaseUrl = "https://sjtzzxqopnyouktcgwwg.supabase.co";
configurable string supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNqdHp6eHFvcG55b3VrdGNnd3dnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyMjA3OTcsImV4cCI6MjA2OTc5Njc5N30.ahvznD6ER2eRz8HE5NkXMOF7epq3v3Zp3GWrvZSplWY";
configurable string countriesApiKey = "NbbEYeZKCdhqG4nmyzcfUHchbhsANAif8kovpiSq";

http:Client supabaseClient = check new (supabaseUrl, {
    timeout: 30,
    httpVersion: http:HTTP_1_1
});

http:Client countriesApiClient = check new ("https://countriesnow.space", {
    timeout: 30,
    httpVersion: http:HTTP_1_1,
    followRedirects: {enabled: true, maxCount: 5}
});

listener http:Listener httpListener = new (9090);

function init() returns error? {
    log:printInfo("MediFind Backend v3.0 starting with full Supabase integration on port 9090");
    log:printInfo("Please ensure database tables are created in Supabase using schema.sql");
    log:printInfo("Ready to serve requests with full Supabase integration...");
}

service on httpListener {
    resource function options .(http:Request req) returns http:Response {
        http:Response res = new;
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        res.statusCode = 204;
        return res;
    }

    resource function get .() returns json {
        return {
            name: "MediFind Backend API",
            version: "3.0.0",
            status: "Running",
            database: "Supabase",
            timestamp: time:utcNow()
        };
    }
}

service /api/v1 on httpListener {
    
    resource function options .(http:Request req) returns http:Response {
        http:Response res = new;
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        res.statusCode = 204;
        return res;
    }

    resource function options [string... paths](http:Request req) returns http:Response {
        http:Response res = new;
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        res.statusCode = 204;
        return res;
    }
    
    resource function get health() returns json {
        return {
            status: "healthy",
            timestamp: time:utcNow(),
            database: "Supabase",
            supabaseUrl: supabaseUrl
        };
    }

    resource function get supabase/test() returns json|error {
        http:Response response = check supabaseClient->get("/rest/v1/", {
            "Authorization": "Bearer " + supabaseKey,
            "apikey": supabaseKey
        });
        
        return {
            success: true,
            status: response.statusCode,
            message: "Supabase connection successful"
        };
    }

    // DATABASE SETUP ENDPOINT - Creates tables and sample data
    resource function options setup(http:Request req) returns http:Response {
        http:Response res = new;
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        res.statusCode = 204;
        return res;
    }

    resource function post setup() returns json|error {
        log:printInfo("Starting database setup...");
        
        // Create sample pharmacy in Supabase
        json demoPharmacy = {
            "id": "demo-pharmacy-id",
            "name": "Demo Pharmacy",
            "email": "demo@pharmacy.com",
            "password": "demo123",
            "address": "Colombo, Sri Lanka",
            "phone": "+94123456789",
            "license_number": "PH001"
        };
        
        http:Response|error pharmacyResponse = supabaseClient->post("/rest/v1/pharmacies", demoPharmacy, {
            "Authorization": "Bearer " + supabaseKey,
            "apikey": supabaseKey,
            "Content-Type": "application/json",
            "Prefer": "return=minimal"
        });
        
        if pharmacyResponse is error {
            log:printError("Failed to create demo pharmacy: " + pharmacyResponse.message());
        } else {
            log:printInfo("Demo pharmacy created successfully");
        }
        
        // Create sample medicines
        json[] sampleMedicines = [
            {
                "id": "med-001",
                "name": "Paracetamol",
                "price": 25.00,
                "description": "Pain relief and fever reducer",
                "pharmacy_id": "demo-pharmacy-id",
                "stock": 100
            },
            {
                "id": "med-002", 
                "name": "Amoxicillin",
                "price": 120.50,
                "description": "Antibiotic for bacterial infections",
                "pharmacy_id": "demo-pharmacy-id",
                "stock": 50
            },
            {
                "id": "med-003",
                "name": "Omeprazole", 
                "price": 85.00,
                "description": "Proton pump inhibitor for acid reflux",
                "pharmacy_id": "demo-pharmacy-id",
                "stock": 75
            }
        ];
        
        int medicinesCreated = 0;
        foreach json medicine in sampleMedicines {
            http:Response|error medicineResponse = supabaseClient->post("/rest/v1/medicines", medicine, {
                "Authorization": "Bearer " + supabaseKey,
                "apikey": supabaseKey,
                "Content-Type": "application/json",
                "Prefer": "return=minimal"
            });
            
            if medicineResponse is error {
                log:printError("Failed to create medicine: " + medicine.toString() + " - " + medicineResponse.message());
            } else {
                medicinesCreated = medicinesCreated + 1;
            }
        }
        
        return {
            success: true,
            message: "Database setup completed",
            pharmacyCreated: pharmacyResponse is http:Response,
            medicinesCreated: medicinesCreated,
            note: "You can now login with demo@pharmacy.com / demo123"
        };
    }

    // PHARMACY LOGIN
    resource function options pharmacyLogin(http:Request req) returns http:Response {
        http:Response res = new;
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        res.statusCode = 204;
        return res;
    }

    resource function post pharmacyLogin(@http:Payload json loginReq) returns http:Response|error {
        if loginReq is map<json> {
            string email = loginReq["email"].toString();
            string password = loginReq["password"].toString();

            // Find pharmacy by email and password in Supabase
            http:Response response = check supabaseClient->get("/rest/v1/pharmacies?email=eq." + email + "&password=eq." + password, {
                "Authorization": "Bearer " + supabaseKey,
                "apikey": supabaseKey,
                "Content-Type": "application/json"
            });

            if response.statusCode != 200 {
                return createErrorResponse(500, "Failed to authenticate with database");
            }

            json pharmacies = check response.getJsonPayload();
            if pharmacies is json[] && pharmacies.length() > 0 {
                json pharmacy = pharmacies[0];
                string pharmacyId = "";
                if pharmacy is map<json> {
                    anydata idValue = pharmacy["id"];
                    if idValue is string {
                        pharmacyId = idValue;
                    }
                }

                // Generate session token
                string token = generateSessionToken(pharmacyId);

                http:Response res = new;
                res.setHeader("Access-Control-Allow-Origin", "*");
                res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
                res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
                res.setHeader("Content-Type", "application/json");
                res.setJsonPayload({
                    success: true,
                    token: token,
                    userId: pharmacyId,
                    userType: "pharmacy",
                    message: "Login successful with Supabase authentication"
                });
                return res;
            }

            return createErrorResponse(401, "Invalid credentials");
        }

        return createErrorResponse(400, "Invalid login data");
    }

    // PHARMACY REGISTRATION
    resource function options pharmacyRegister(http:Request req) returns http:Response {
        http:Response res = new;
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        res.statusCode = 204;
        return res;
    }

    resource function post pharmacyRegister(@http:Payload json pharmacyReq) returns http:Response|error {
        if pharmacyReq is map<json> {
            string pharmacyId = uuid:createType4AsString();
            
            json pharmacy = {
                "id": pharmacyId,
                "name": pharmacyReq["name"],
                "email": pharmacyReq["email"],
                "password": pharmacyReq["password"],
                "address": pharmacyReq["address"] ?: "",
                "phone": pharmacyReq["phone"] ?: "",
                "license_number": pharmacyReq["licenseNumber"] ?: ""
            };

            // Check if email already exists
            http:Response|error checkResponse = supabaseClient->get("/rest/v1/pharmacies?email=eq." + pharmacyReq["email"].toString(), {
                "Authorization": "Bearer " + supabaseKey,
                "apikey": supabaseKey,
                "Content-Type": "application/json"
            });

            if checkResponse is error {
                log:printError("Supabase connection failed: " + checkResponse.message());
                return createErrorResponse(500, "Database connection failed. Please ensure Supabase tables are created using schema.sql");
            }

            json|error existingPharmacies = checkResponse.getJsonPayload();
            if existingPharmacies is error {
                log:printError("Failed to parse Supabase response: " + existingPharmacies.message());
                return createErrorResponse(500, "Database error. Tables may not exist. Please create tables using schema.sql");
            }

            if existingPharmacies is json[] && existingPharmacies.length() > 0 {
                return createErrorResponse(409, "Pharmacy with this email already exists");
            }

            // Store in Supabase
            http:Response|error response = supabaseClient->post("/rest/v1/pharmacies", pharmacy, {
                "Authorization": "Bearer " + supabaseKey,
                "apikey": supabaseKey,
                "Content-Type": "application/json",
                "Prefer": "return=representation"
            });

            if response is error {
                log:printError("Failed to insert into Supabase: " + response.message());
                return createErrorResponse(500, "Failed to register pharmacy. Please ensure database tables are created using schema.sql");
            }

            if response.statusCode != 201 {
                // Get the error details from Supabase
                json|error errorPayload = response.getJsonPayload();
                string errorMsg = "Unknown error";
                if errorPayload is json {
                    errorMsg = errorPayload.toString();
                }
                log:printError("Supabase insert failed with status: " + response.statusCode.toString() + " - " + errorMsg);
                return createErrorResponse(500, "Failed to register pharmacy in database. Error: " + errorMsg);
            }

            json|error createdPharmacy = response.getJsonPayload();
            if createdPharmacy is error {
                log:printError("Failed to parse created pharmacy: " + createdPharmacy.message());
            }
            
            // Generate session token for auto-login after registration
            string token = generateSessionToken(pharmacyId);
            
            http:Response res = new;
            res.setHeader("Access-Control-Allow-Origin", "*");
            res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
            res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
            res.setHeader("Content-Type", "application/json");
            res.setJsonPayload({
                success: true,
                message: "Pharmacy registered successfully in Supabase",
                token: token,
                userId: pharmacyId,
                userType: "pharmacy"
            });
            return res;
        }

        return createErrorResponse(400, "Invalid pharmacy data");
    }

    // MEDICINES ENDPOINTS
    resource function options medicines(http:Request req) returns http:Response {
        http:Response res = new;
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        res.statusCode = 204;
        return res;
    }

    resource function get medicines(http:Request req) returns http:Response|error {
        string|http:HeaderNotFoundError authHeader = req.getHeader("Authorization");
        string? pharmacyId = validateToken(authHeader is string ? authHeader : ());
        
        if pharmacyId is () {
            return createErrorResponse(401, "Unauthorized access");
        }

        // Get medicines from Supabase
        http:Response response = check supabaseClient->get("/rest/v1/medicines?pharmacy_id=eq." + pharmacyId, {
            "Authorization": "Bearer " + supabaseKey,
            "apikey": supabaseKey,
            "Content-Type": "application/json"
        });

        if response.statusCode != 200 {
            return createErrorResponse(500, "Failed to fetch medicines from database");
        }

        json medicines = check response.getJsonPayload();
        
        http:Response res = new;
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        res.setHeader("Content-Type", "application/json");
        res.setJsonPayload({
            medicines: medicines,
            message: "Medicines fetched successfully from Supabase",
            timestamp: time:utcNow()
        });
        return res;
    }

    resource function post medicines(@http:Payload json medicineReq, http:Request req) returns http:Response|error {
        string|http:HeaderNotFoundError authHeader = req.getHeader("Authorization");
        string? pharmacyId = validateToken(authHeader is string ? authHeader : ());
        
        if pharmacyId is () {
            return createErrorResponse(401, "Unauthorized access");
        }

        if medicineReq is map<json> {
            string medicineId = uuid:createType4AsString();
            
            // Process price field
            float price = 0.0;
            anydata priceValue = medicineReq["price"];
            if priceValue is float {
                price = priceValue;
            } else if priceValue is int {
                price = <float>priceValue;
            } else if priceValue is string {
                price = check float:fromString(priceValue);
            }

            json medicine = {
                "id": medicineId,
                "name": medicineReq["name"],
                "price": price,
                "description": medicineReq["description"] ?: "",
                "category": medicineReq["category"] ?: "General",
                "pharmacy_id": pharmacyId,
                "stock": medicineReq["stock"] ?: 0,
                "status": medicineReq["status"] ?: "available",
                "manufacturer": medicineReq["manufacturer"] ?: "",
                "expiry_date": medicineReq["expiry_date"] ?: ()
            };

            // Store in Supabase
            http:Response response = check supabaseClient->post("/rest/v1/medicines", medicine, {
                "Authorization": "Bearer " + supabaseKey,
                "apikey": supabaseKey,
                "Content-Type": "application/json",
                "Prefer": "return=representation"
            });

            if response.statusCode != 201 {
                json|error errorPayload = response.getJsonPayload();
                string errorMsg = "Unknown error";
                if errorPayload is json {
                    errorMsg = errorPayload.toString();
                }
                log:printError("Supabase medicine creation failed: " + errorMsg + " (Status: " + response.statusCode.toString() + ")");
                return createErrorResponse(500, "Failed to add medicine to database: " + errorMsg);
            }

            json createdMedicine = check response.getJsonPayload();
            
            http:Response res = new;
            res.setHeader("Access-Control-Allow-Origin", "*");
            res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
            res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
            res.setHeader("Content-Type", "application/json");
            res.setJsonPayload({
                success: true,
                message: "Medicine added successfully to Supabase",
                medicine: createdMedicine
            });
            return res;
        }

        return createErrorResponse(400, "Invalid medicine data");
    }

    resource function put medicines/[string medicineId](@http:Payload json medicineReq, http:Request req) returns http:Response|error {
        string|http:HeaderNotFoundError authHeader = req.getHeader("Authorization");
        string? pharmacyId = validateToken(authHeader is string ? authHeader : ());
        
        if pharmacyId is () {
            return createErrorResponse(401, "Unauthorized access");
        }

        if medicineReq is map<json> {
            // Build update object with only provided fields
            map<json> updateData = {};
            
            if medicineReq.hasKey("name") {
                updateData["name"] = medicineReq["name"];
            }
            if medicineReq.hasKey("price") {
                float price = 0.0;
                anydata priceValue = medicineReq["price"];
                if priceValue is float {
                    price = priceValue;
                } else if priceValue is int {
                    price = <float>priceValue;
                } else if priceValue is string {
                    price = check float:fromString(priceValue);
                }
                updateData["price"] = price;
            }
            if medicineReq.hasKey("description") {
                updateData["description"] = medicineReq["description"];
            }
            if medicineReq.hasKey("category") {
                updateData["category"] = medicineReq["category"];
            }
            if medicineReq.hasKey("stock") {
                updateData["stock"] = medicineReq["stock"];
            }
            if medicineReq.hasKey("status") {
                updateData["status"] = medicineReq["status"];
            }
            if medicineReq.hasKey("expiry_date") {
                updateData["expiry_date"] = medicineReq["expiry_date"];
            }
            if medicineReq.hasKey("manufacturer") {
                updateData["manufacturer"] = medicineReq["manufacturer"];
            }

            // Update in Supabase with pharmacy ownership check
            http:Response response = check supabaseClient->patch("/rest/v1/medicines?id=eq." + medicineId + "&pharmacy_id=eq." + pharmacyId, updateData, {
                "Authorization": "Bearer " + supabaseKey,
                "apikey": supabaseKey,
                "Content-Type": "application/json",
                "Prefer": "return=representation"
            });

            if response.statusCode != 200 {
                json|error errorPayload = response.getJsonPayload();
                string errorMsg = "Unknown error";
                if errorPayload is json {
                    errorMsg = errorPayload.toString();
                }
                return createErrorResponse(500, "Failed to update medicine: " + errorMsg);
            }

            json|error updatedMedicine = response.getJsonPayload();
            if updatedMedicine is error {
                return createErrorResponse(500, "Update successful but failed to retrieve updated data");
            }

            http:Response res = new;
            res.setHeader("Access-Control-Allow-Origin", "*");
            res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
            res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
            res.setHeader("Content-Type", "application/json");
            res.setJsonPayload({
                success: true,
                medicine: updatedMedicine,
                message: "Medicine updated successfully"
            });
            return res;
        }

        return createErrorResponse(400, "Invalid update data");
    }

    // ANALYTICS ENDPOINT
    resource function options analytics(http:Request req) returns http:Response {
        http:Response res = new;
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        res.statusCode = 204;
        return res;
    }

    resource function get analytics(http:Request req) returns http:Response|error {
        string|http:HeaderNotFoundError authHeader = req.getHeader("Authorization");
        string? pharmacyId = validateToken(authHeader is string ? authHeader : ());
        
        if pharmacyId is () {
            return createErrorResponse(401, "Unauthorized access");
        }

        // Get medicines with analytics data from Supabase
        http:Response response = check supabaseClient->get("/rest/v1/medicines?pharmacy_id=eq." + pharmacyId, {
            "Authorization": "Bearer " + supabaseKey,
            "apikey": supabaseKey,
            "Content-Type": "application/json"
        });

        if response.statusCode != 200 {
            return createErrorResponse(500, "Failed to fetch medicines from database");
        }

        json medicines = check response.getJsonPayload();
        
        // Calculate analytics
        int totalMedicines = 0;
        int lowStockItems = 0;
        int outOfStockItems = 0;
        float totalInventoryValue = 0.0;
        json[] categoryStats = [];
        json[] statusStats = [];
        
        if medicines is json[] {
            totalMedicines = medicines.length();
            
            // Category and status tracking
            map<int> categoryCount = {};
            map<int> statusCount = {};
            
            foreach json medicine in medicines {
                if medicine is map<json> {
                    // Stock analysis
                    anydata stockValue = medicine["stock"];
                    int stock = 0;
                    if stockValue is int {
                        stock = stockValue;
                    }
                    
                    if stock == 0 {
                        outOfStockItems = outOfStockItems + 1;
                    } else if stock <= 10 {
                        lowStockItems = lowStockItems + 1;
                    }
                    
                    // Inventory value calculation
                    anydata priceValue = medicine["price"];
                    float price = 0.0;
                    if priceValue is float {
                        price = priceValue;
                    } else if priceValue is int {
                        price = <float>priceValue;
                    }
                    totalInventoryValue = totalInventoryValue + (price * <float>stock);
                    
                    // Category stats
                    anydata categoryValue = medicine["category"];
                    string category = "General";
                    if categoryValue is string {
                        category = categoryValue;
                    }
                    
                    if categoryCount.hasKey(category) {
                        categoryCount[category] = categoryCount.get(category) + 1;
                    } else {
                        categoryCount[category] = 1;
                    }
                    
                    // Status stats
                    anydata statusValue = medicine["status"];
                    string status = "available";
                    if statusValue is string {
                        status = statusValue;
                    }
                    
                    if statusCount.hasKey(status) {
                        statusCount[status] = statusCount.get(status) + 1;
                    } else {
                        statusCount[status] = 1;
                    }
                }
            }
            
            // Convert maps to arrays
            foreach var [category, count] in categoryCount.entries() {
                categoryStats.push({
                    "category": category,
                    "count": count
                });
            }
            
            foreach var [status, count] in statusCount.entries() {
                statusStats.push({
                    "status": status,
                    "count": count
                });
            }
        }
        
        json analyticsData = {
            "totalMedicines": totalMedicines,
            "lowStockItems": lowStockItems,
            "outOfStockItems": outOfStockItems,
            "totalInventoryValue": totalInventoryValue,
            "categoryBreakdown": categoryStats,
            "statusBreakdown": statusStats,
            "timestamp": time:utcNow()
        };

        http:Response res = new;
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        res.setHeader("Content-Type", "application/json");
        res.setJsonPayload({
            success: true,
            analytics: analyticsData,
            message: "Analytics data generated successfully"
        });
        return res;
    }

    // SEARCH ENDPOINT
    resource function options search(http:Request req) returns http:Response {
        http:Response res = new;
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        res.statusCode = 204;
        return res;
    }

    resource function post search(@http:Payload json searchReq) returns http:Response|error {
        string medicineName = "";
        if searchReq is map<json> {
            anydata medNameValue = searchReq["medicineName"];
            if medNameValue is string {
                medicineName = medNameValue;
            }
        }
        
        // Search medicines in Supabase and join with pharmacy information
        string searchQuery = "/rest/v1/medicines?name=ilike.*" + medicineName + "*&select=*,pharmacies(name,phone,email,address,license_number)";
        http:Response response = check supabaseClient->get(searchQuery, {
            "Authorization": "Bearer " + supabaseKey,
            "apikey": supabaseKey,
            "Content-Type": "application/json"
        });

        if response.statusCode != 200 {
            return createErrorResponse(500, "Failed to search medicines in database");
        }

        json medicines = check response.getJsonPayload();
        int totalCount = 0;
        if medicines is json[] {
            totalCount = medicines.length();
        }

        json responseBody = {
            medicines: medicines,
            totalCount: totalCount,
            searchTerm: medicineName,
            message: totalCount > 0 ? "Search completed successfully" : "No medicines found",
            dataSource: "Supabase Database"
        };

        http:Response res = new;
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        res.setHeader("Content-Type", "application/json");
        res.setJsonPayload(responseBody);
        return res;
    }

    // COUNTRIES API ENDPOINTS
    resource function options countries(http:Request req) returns http:Response {
        http:Response res = new;
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        res.statusCode = 204;
        return res;
    }

    resource function get countries() returns http:Response|error {
        // Try to fetch countries from CountriesNow API with fallback
        http:Response|error response = countriesApiClient->get("/api/v0.1/countries");
        
        json fallbackCountries = [
            {"country": "Afghanistan"},
            {"country": "Albania"},
            {"country": "Algeria"},
            {"country": "Australia"},
            {"country": "Austria"},
            {"country": "Bangladesh"},
            {"country": "Brazil"},
            {"country": "Canada"},
            {"country": "China"},
            {"country": "Egypt"},
            {"country": "France"},
            {"country": "Germany"},
            {"country": "India"},
            {"country": "Indonesia"},
            {"country": "Italy"},
            {"country": "Japan"},
            {"country": "Mexico"},
            {"country": "Netherlands"},
            {"country": "Pakistan"},
            {"country": "Russia"},
            {"country": "South Africa"},
            {"country": "Spain"},
            {"country": "Sri Lanka"},
            {"country": "Turkey"},
            {"country": "United Kingdom"},
            {"country": "United States"}
        ];
        
        json countriesData = fallbackCountries;
        
        if response is error {
            log:printError("Failed to fetch countries from Countries API, using fallback: " + response.message());
        } else if response.statusCode != 200 {
            log:printError("Countries API returned status: " + response.statusCode.toString() + ", using fallback");
        } else {
            json|error apiData = response.getJsonPayload();
            if apiData is json && apiData is map<json> && apiData.hasKey("data") {
                anydata apiCountriesData = apiData["data"];
                if apiCountriesData is json[] {
                    log:printInfo("Successfully fetched " + apiCountriesData.length().toString() + " countries from external API");
                    // The external API data is already in the correct format with "country" property
                    countriesData = apiCountriesData;
                } else {
                    log:printError("External API countries data is not an array, using fallback");
                }
            } else {
                log:printError("Failed to parse countries response structure, using fallback");
            }
        }

        http:Response res = new;
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        res.setHeader("Content-Type", "application/json");
        res.setJsonPayload({
            success: true,
            data: {
                data: countriesData
            },
            message: "Countries fetched successfully"
        });
        return res;
    }

    resource function options countries/states(http:Request req) returns http:Response {
        http:Response res = new;
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        res.statusCode = 204;
        return res;
    }

    // GET endpoint for states with query parameter (making country parameter optional)
    resource function get countries/states(http:Request req, string? country = ()) returns http:Response|error {
        // If no country provided, return error
        if country is () {
            http:Response res = new;
            res.setHeader("Access-Control-Allow-Origin", "*");
            res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
            res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
            res.setHeader("Content-Type", "application/json");
            res.statusCode = 400;
            res.setJsonPayload({
                success: false,
                message: "Country parameter is required"
            });
            return res;
        }
        
        log:printInfo("GET request for states of: " + country);
        
        // Try to fetch from external API first for ALL countries
        http:Response|error response = countriesApiClient->post("/api/v0.1/countries/states", {
            "country": country
        });
        
        if response is http:Response && response.statusCode == 200 {
            json|error apiData = response.getJsonPayload();
            if apiData is json {
                log:printInfo("Successfully fetched states for " + country + " from external API");
                http:Response res = new;
                res.setHeader("Access-Control-Allow-Origin", "*");
                res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
                res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
                res.setHeader("Content-Type", "application/json");
                res.setJsonPayload({
                    success: true,
                    data: apiData,
                    message: "States fetched successfully from external API",
                    country: country
                });
                return res;
            }
        }
        
        log:printInfo("External API failed, using fallback data for: " + country);
        
        // Fallback states data for common countries (only as backup)
        map<json[]> fallbackStates = {
            "United States": [
                {"name": "Alabama"}, {"name": "Alaska"}, {"name": "Arizona"}, {"name": "Arkansas"}, 
                {"name": "California"}, {"name": "Colorado"}, {"name": "Connecticut"}, {"name": "Delaware"}, 
                {"name": "Florida"}, {"name": "Georgia"}, {"name": "Hawaii"}, {"name": "Idaho"}, 
                {"name": "Illinois"}, {"name": "Indiana"}, {"name": "Iowa"}, {"name": "Kansas"}, 
                {"name": "Kentucky"}, {"name": "Louisiana"}, {"name": "Maine"}, {"name": "Maryland"}, 
                {"name": "Massachusetts"}, {"name": "Michigan"}, {"name": "Minnesota"}, {"name": "Mississippi"}, 
                {"name": "Missouri"}, {"name": "Montana"}, {"name": "Nebraska"}, {"name": "Nevada"}, 
                {"name": "New Hampshire"}, {"name": "New Jersey"}, {"name": "New Mexico"}, {"name": "New York"}, 
                {"name": "North Carolina"}, {"name": "North Dakota"}, {"name": "Ohio"}, {"name": "Oklahoma"}, 
                {"name": "Oregon"}, {"name": "Pennsylvania"}, {"name": "Rhode Island"}, {"name": "South Carolina"}, 
                {"name": "South Dakota"}, {"name": "Tennessee"}, {"name": "Texas"}, {"name": "Utah"}, 
                {"name": "Vermont"}, {"name": "Virginia"}, {"name": "Washington"}, {"name": "West Virginia"}, 
                {"name": "Wisconsin"}, {"name": "Wyoming"}
            ],
            "Canada": [
                {"name": "Alberta"}, {"name": "British Columbia"}, {"name": "Manitoba"}, 
                {"name": "New Brunswick"}, {"name": "Newfoundland and Labrador"}, {"name": "Northwest Territories"}, 
                {"name": "Nova Scotia"}, {"name": "Nunavut"}, {"name": "Ontario"}, {"name": "Prince Edward Island"}, 
                {"name": "Quebec"}, {"name": "Saskatchewan"}, {"name": "Yukon"}
            ],
            "Australia": [
                {"name": "Australian Capital Territory"}, {"name": "New South Wales"}, {"name": "Northern Territory"}, 
                {"name": "Queensland"}, {"name": "South Australia"}, {"name": "Tasmania"}, 
                {"name": "Victoria"}, {"name": "Western Australia"}
            ],
            "India": [
                {"name": "Andhra Pradesh"}, {"name": "Arunachal Pradesh"}, {"name": "Assam"}, {"name": "Bihar"}, 
                {"name": "Chhattisgarh"}, {"name": "Goa"}, {"name": "Gujarat"}, {"name": "Haryana"}, 
                {"name": "Himachal Pradesh"}, {"name": "Jharkhand"}, {"name": "Karnataka"}, {"name": "Kerala"}, 
                {"name": "Madhya Pradesh"}, {"name": "Maharashtra"}, {"name": "Manipur"}, {"name": "Meghalaya"}, 
                {"name": "Mizoram"}, {"name": "Nagaland"}, {"name": "Odisha"}, {"name": "Punjab"}, 
                {"name": "Rajasthan"}, {"name": "Sikkim"}, {"name": "Tamil Nadu"}, {"name": "Telangana"}, 
                {"name": "Tripura"}, {"name": "Uttar Pradesh"}, {"name": "Uttarakhand"}, {"name": "West Bengal"}
            ]
        };
        
        json statesData = {"data": {"states": fallbackStates.hasKey(country) ? fallbackStates[country] : []}};

        http:Response res = new;
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        res.setHeader("Content-Type", "application/json");
        res.setJsonPayload({
            success: true,
            data: statesData,
            message: "States fetched successfully (fallback data)",
            country: country
        });
        return res;
    }

    // POST endpoint for states (existing functionality)
    resource function post countries/states(@http:Payload json countryReq) returns http:Response|error {
        log:printInfo("Received states request: " + countryReq.toString());
        
        if countryReq is map<json> && countryReq.hasKey("country") {
            anydata countryValue = countryReq["country"];
            if countryValue is string {
                log:printInfo("Looking up states for country: " + countryValue);
                
                // Try external API first for ALL countries
                http:Response|error statesResponse = countriesApiClient->post("/api/v0.1/countries/states", {
                    "country": countryValue
                });
                
                if statesResponse is http:Response && statesResponse.statusCode == 200 {
                    json|error apiData = statesResponse.getJsonPayload();
                    if apiData is json {
                        log:printInfo("Successfully fetched states from external API for: " + countryValue);
                        http:Response res = new;
                        res.setHeader("Access-Control-Allow-Origin", "*");
                        res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
                        res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
                        res.setHeader("Content-Type", "application/json");
                        res.setJsonPayload({
                            success: true,
                            data: apiData,
                            message: "States fetched successfully from external API"
                        });
                        return res;
                    }
                }
                
                log:printInfo("External API failed or returned no data, using fallback data for: " + countryValue);
                map<json[]> fallbackStates = {
                    "United States": [
                        {"name": "Alabama"}, {"name": "Alaska"}, {"name": "Arizona"}, {"name": "Arkansas"}, 
                        {"name": "California"}, {"name": "Colorado"}, {"name": "Connecticut"}, {"name": "Delaware"}, 
                        {"name": "Florida"}, {"name": "Georgia"}, {"name": "Hawaii"}, {"name": "Idaho"}, 
                        {"name": "Illinois"}, {"name": "Indiana"}, {"name": "Iowa"}, {"name": "Kansas"}, 
                        {"name": "Kentucky"}, {"name": "Louisiana"}, {"name": "Maine"}, {"name": "Maryland"}, 
                        {"name": "Massachusetts"}, {"name": "Michigan"}, {"name": "Minnesota"}, {"name": "Mississippi"}, 
                        {"name": "Missouri"}, {"name": "Montana"}, {"name": "Nebraska"}, {"name": "Nevada"}, 
                        {"name": "New Hampshire"}, {"name": "New Jersey"}, {"name": "New Mexico"}, {"name": "New York"}, 
                        {"name": "North Carolina"}, {"name": "North Dakota"}, {"name": "Ohio"}, {"name": "Oklahoma"}, 
                        {"name": "Oregon"}, {"name": "Pennsylvania"}, {"name": "Rhode Island"}, {"name": "South Carolina"}, 
                        {"name": "South Dakota"}, {"name": "Tennessee"}, {"name": "Texas"}, {"name": "Utah"}, 
                        {"name": "Vermont"}, {"name": "Virginia"}, {"name": "Washington"}, {"name": "West Virginia"}, 
                        {"name": "Wisconsin"}, {"name": "Wyoming"}
                    ],
                    "Canada": [
                        {"name": "Alberta"}, {"name": "British Columbia"}, {"name": "Manitoba"}, 
                        {"name": "New Brunswick"}, {"name": "Newfoundland and Labrador"}, {"name": "Northwest Territories"}, 
                        {"name": "Nova Scotia"}, {"name": "Nunavut"}, {"name": "Ontario"}, {"name": "Prince Edward Island"}, 
                        {"name": "Quebec"}, {"name": "Saskatchewan"}, {"name": "Yukon"}
                    ],
                    "Australia": [
                        {"name": "Australian Capital Territory"}, {"name": "New South Wales"}, {"name": "Northern Territory"}, 
                        {"name": "Queensland"}, {"name": "South Australia"}, {"name": "Tasmania"}, 
                        {"name": "Victoria"}, {"name": "Western Australia"}
                    ],
                    "India": [
                        {"name": "Andhra Pradesh"}, {"name": "Arunachal Pradesh"}, {"name": "Assam"}, {"name": "Bihar"}, 
                        {"name": "Chhattisgarh"}, {"name": "Goa"}, {"name": "Gujarat"}, {"name": "Haryana"}, 
                        {"name": "Himachal Pradesh"}, {"name": "Jharkhand"}, {"name": "Karnataka"}, {"name": "Kerala"}, 
                        {"name": "Madhya Pradesh"}, {"name": "Maharashtra"}, {"name": "Manipur"}, {"name": "Meghalaya"}, 
                        {"name": "Mizoram"}, {"name": "Nagaland"}, {"name": "Odisha"}, {"name": "Punjab"}, 
                        {"name": "Rajasthan"}, {"name": "Sikkim"}, {"name": "Tamil Nadu"}, {"name": "Telangana"}, 
                        {"name": "Tripura"}, {"name": "Uttar Pradesh"}, {"name": "Uttarakhand"}, {"name": "West Bengal"}
                    ],
                    "Brazil": [
                        {"name": "Acre"}, {"name": "Alagoas"}, {"name": "Amapá"}, {"name": "Amazonas"}, 
                        {"name": "Bahia"}, {"name": "Ceará"}, {"name": "Distrito Federal"}, {"name": "Espírito Santo"}, 
                        {"name": "Goiás"}, {"name": "Maranhão"}, {"name": "Mato Grosso"}, {"name": "Mato Grosso do Sul"}, 
                        {"name": "Minas Gerais"}, {"name": "Pará"}, {"name": "Paraíba"}, {"name": "Paraná"}, 
                        {"name": "Pernambuco"}, {"name": "Piauí"}, {"name": "Rio de Janeiro"}, {"name": "Rio Grande do Norte"}, 
                        {"name": "Rio Grande do Sul"}, {"name": "Rondônia"}, {"name": "Roraima"}, {"name": "Santa Catarina"}, 
                        {"name": "São Paulo"}, {"name": "Sergipe"}, {"name": "Tocantins"}
                    ],
                    "Germany": [
                        {"name": "Baden-Württemberg"}, {"name": "Bavaria"}, {"name": "Berlin"}, {"name": "Brandenburg"}, 
                        {"name": "Bremen"}, {"name": "Hamburg"}, {"name": "Hesse"}, {"name": "Lower Saxony"}, 
                        {"name": "Mecklenburg-Vorpommern"}, {"name": "North Rhine-Westphalia"}, {"name": "Rhineland-Palatinate"}, 
                        {"name": "Saarland"}, {"name": "Saxony"}, {"name": "Saxony-Anhalt"}, {"name": "Schleswig-Holstein"}, 
                        {"name": "Thuringia"}
                    ],
                    "Mexico": [
                        {"name": "Aguascalientes"}, {"name": "Baja California"}, {"name": "Baja California Sur"}, {"name": "Campeche"}, 
                        {"name": "Chiapas"}, {"name": "Chihuahua"}, {"name": "Coahuila"}, {"name": "Colima"}, 
                        {"name": "Durango"}, {"name": "Guanajuato"}, {"name": "Guerrero"}, {"name": "Hidalgo"}, 
                        {"name": "Jalisco"}, {"name": "México"}, {"name": "Michoacán"}, {"name": "Morelos"}, 
                        {"name": "Nayarit"}, {"name": "Nuevo León"}, {"name": "Oaxaca"}, {"name": "Puebla"}, 
                        {"name": "Querétaro"}, {"name": "Quintana Roo"}, {"name": "San Luis Potosí"}, {"name": "Sinaloa"}, 
                        {"name": "Sonora"}, {"name": "Tabasco"}, {"name": "Tamaulipas"}, {"name": "Tlaxcala"}, 
                        {"name": "Veracruz"}, {"name": "Yucatán"}, {"name": "Zacatecas"}
                    ]
                };
                
                json[] statesArray = fallbackStates.hasKey(countryValue) ? <json[]>fallbackStates[countryValue] : [];
                log:printInfo("Found " + statesArray.length().toString() + " states for country: " + countryValue);
                
                json statesData = {"data": {"states": statesArray}};
                
                http:Response res = new;
                res.setHeader("Access-Control-Allow-Origin", "*");
                res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
                res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
                res.setHeader("Content-Type", "application/json");
                res.setJsonPayload({
                    success: true,
                    data: statesData,
                    message: "States fetched successfully"
                });
                return res;
            }
        }

        return createErrorResponse(400, "Invalid country request");
    }

    resource function options countries/cities(http:Request req) returns http:Response {
        http:Response res = new;
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        res.statusCode = 204;
        return res;
    }

    // GET endpoint for cities with query parameters
    resource function get countries/cities(http:Request req, string country, string state) returns http:Response|error {
        log:printInfo("GET request for cities of: " + state + ", " + country);
        
        // Try external API with multiple strategies for maximum coverage
        // Strategy 1: Try with exact state/province name
        http:Response|error response = countriesApiClient->post("/api/v0.1/countries/state/cities", {
            "country": country,
            "state": state
        });
        
        if response is http:Response && response.statusCode == 200 {
            json|error apiData = response.getJsonPayload();
            if apiData is json && apiData is map<json> {
                anydata citiesArray = apiData["data"];
                if citiesArray is json[] && citiesArray.length() > 0 {
                    log:printInfo("GET Strategy 1 SUCCESS: Fetched " + citiesArray.length().toString() + " cities from external API for: " + state + ", " + country);
                    http:Response res = new;
                    res.setHeader("Access-Control-Allow-Origin", "*");
                    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
                    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
                    res.setHeader("Content-Type", "application/json");
                    res.setJsonPayload({
                        success: true,
                        data: apiData,
                        message: "Cities fetched successfully from external API (GET Strategy 1)",
                        country: country,
                        state: state
                    });
                    return res;
                }
            }
        }
        
        // Strategy 2: Try alternative state names by removing common suffixes
        string[] alternativeStateNames = [];
        if state.endsWith(" District") {
            alternativeStateNames.push(state.substring(0, state.length() - 9)); // Remove " District"
        }
        if state.endsWith(" Province") {
            alternativeStateNames.push(state.substring(0, state.length() - 9)); // Remove " Province"
        }
        if state.endsWith(" Region") {
            alternativeStateNames.push(state.substring(0, state.length() - 7)); // Remove " Region"
        }
        
        foreach string altStateName in alternativeStateNames {
            http:Response|error altResponse = countriesApiClient->post("/api/v0.1/countries/state/cities", {
                "country": country,
                "state": altStateName
            });
            
            if altResponse is http:Response && altResponse.statusCode == 200 {
                json|error altApiData = altResponse.getJsonPayload();
                if altApiData is json && altApiData is map<json> {
                    anydata altCitiesArray = altApiData["data"];
                    if altCitiesArray is json[] && altCitiesArray.length() > 0 {
                        log:printInfo("GET Strategy 2 SUCCESS: Fetched " + altCitiesArray.length().toString() + " cities using alternative name '" + altStateName + "' for: " + country);
                        http:Response res = new;
                        res.setHeader("Access-Control-Allow-Origin", "*");
                        res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
                        res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
                        res.setHeader("Content-Type", "application/json");
                        res.setJsonPayload({
                            success: true,
                            data: altApiData,
                            message: "Cities fetched successfully from external API (GET Strategy 2: '" + altStateName + "')",
                            country: country,
                            state: state
                        });
                        return res;
                    }
                }
            }
        }
        
        log:printInfo("All GET external API strategies failed, using enhanced fallback data for: " + state + ", " + country);
        
        // Fallback cities data for common states (only as backup)
        map<string[]> fallbackCities = {
            "California": ["Los Angeles", "San Francisco", "San Diego", "Sacramento", "San Jose", "Fresno", "Long Beach", "Oakland"],
            "New York": ["New York City", "Buffalo", "Rochester", "Syracuse", "Albany", "Schenectady", "Troy", "Utica"],
            "Texas": ["Houston", "Dallas", "San Antonio", "Austin", "Fort Worth", "El Paso", "Arlington", "Corpus Christi"],
            "Florida": ["Miami", "Tampa", "Orlando", "Jacksonville", "St. Petersburg", "Hialeah", "Fort Lauderdale", "Tallahassee"],
            "Ontario": ["Toronto", "Ottawa", "Mississauga", "Hamilton", "Brampton", "London", "Markham", "Windsor"],
            "British Columbia": ["Vancouver", "Victoria", "Surrey", "Burnaby", "Richmond", "Abbotsford", "Coquitlam", "Kelowna"],
            "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Thane", "Nashville", "Aurangabad", "Solapur", "Dhule"]
        };
        
        string[] cities = fallbackCities.hasKey(state) ? (fallbackCities[state] ?: ["No cities available"]) : ["No cities available"];
        json citiesData = {"data": cities};

        http:Response res = new;
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        res.setHeader("Content-Type", "application/json");
        res.setJsonPayload({
            success: true,
            data: citiesData,
            message: "Cities fetched successfully (fallback data)",
            country: country,
            state: state
        });
        return res;
    }

    // POST endpoint for cities (existing functionality)
    resource function post countries/cities(@http:Payload json locationReq) returns http:Response|error {
        log:printInfo("Received cities request: " + locationReq.toString());
        
        if locationReq is map<json> && locationReq.hasKey("country") && locationReq.hasKey("state") {
            anydata countryValue = locationReq["country"];
            anydata stateValue = locationReq["state"];
            
            if countryValue is string && stateValue is string {
                log:printInfo("Looking up cities for: " + stateValue + ", " + countryValue);
                
                // Try external API with multiple strategies for maximum coverage
                json|error apiCitiesData = ();
                
                // Strategy 1: Try with exact state/province name
                http:Response|error citiesResponse = countriesApiClient->post("/api/v0.1/countries/state/cities", {
                    "country": countryValue,
                    "state": stateValue
                });
                
                if citiesResponse is http:Response && citiesResponse.statusCode == 200 {
                    json|error apiData = citiesResponse.getJsonPayload();
                    if apiData is json && apiData is map<json> {
                        anydata citiesDataArray = apiData["data"];
                        if citiesDataArray is json[] && citiesDataArray.length() > 0 {
                            log:printInfo("Strategy 1 SUCCESS: Fetched " + citiesDataArray.length().toString() + " cities from external API for: " + stateValue + ", " + countryValue);
                            http:Response res = new;
                            res.setHeader("Access-Control-Allow-Origin", "*");
                            res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
                            res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
                            res.setHeader("Content-Type", "application/json");
                            res.setJsonPayload({
                                success: true,
                                data: apiData,
                                message: "Cities fetched successfully from external API (Strategy 1)"
                            });
                            return res;
                        }
                    }
                }
                
                // Strategy 2: Try removing common suffixes from state names
                string[] alternativeStateNames = [];
                if stateValue.endsWith(" District") {
                    alternativeStateNames.push(stateValue.substring(0, stateValue.length() - 9)); // Remove " District"
                }
                if stateValue.endsWith(" Province") {
                    alternativeStateNames.push(stateValue.substring(0, stateValue.length() - 9)); // Remove " Province"
                }
                if stateValue.endsWith(" Region") {
                    alternativeStateNames.push(stateValue.substring(0, stateValue.length() - 7)); // Remove " Region"
                }
                // Also try the original without any modifications
                alternativeStateNames.push(stateValue);
                
                foreach string altStateName in alternativeStateNames {
                    http:Response|error altCitiesResponse = countriesApiClient->post("/api/v0.1/countries/state/cities", {
                        "country": countryValue,
                        "state": altStateName
                    });
                    
                    if altCitiesResponse is http:Response && altCitiesResponse.statusCode == 200 {
                        json|error altApiData = altCitiesResponse.getJsonPayload();
                        if altApiData is json && altApiData is map<json> {
                            anydata altCitiesArray = altApiData["data"];
                            if altCitiesArray is json[] && altCitiesArray.length() > 0 {
                                log:printInfo("Strategy 2 SUCCESS: Fetched " + altCitiesArray.length().toString() + " cities using alternative name '" + altStateName + "' for: " + countryValue);
                                http:Response res = new;
                                res.setHeader("Access-Control-Allow-Origin", "*");
                                res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
                                res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
                                res.setHeader("Content-Type", "application/json");
                                res.setJsonPayload({
                                    success: true,
                                    data: altApiData,
                                    message: "Cities fetched successfully from external API (Strategy 2: '" + altStateName + "')"
                                });
                                return res;
                            }
                        }
                    }
                }
                
                log:printInfo("All external API strategies failed, using enhanced fallback data for: " + stateValue + ", " + countryValue);
                
                log:printInfo("External API failed or returned no data, using enhanced fallback data for: " + stateValue + ", " + countryValue);
                
                // Enhanced fallback cities data for various countries and states
                map<string[]> fallbackCities = {
                    // United States
                    "California": ["Los Angeles", "San Francisco", "San Diego", "Sacramento", "San Jose", "Fresno", "Long Beach", "Oakland", "Bakersfield", "Anaheim"],
                    "New York": ["New York City", "Buffalo", "Rochester", "Syracuse", "Albany", "Schenectady", "Troy", "Utica", "Yonkers", "New Rochelle"],
                    "Texas": ["Houston", "Dallas", "San Antonio", "Austin", "Fort Worth", "El Paso", "Arlington", "Corpus Christi", "Plano", "Lubbock"],
                    "Florida": ["Miami", "Tampa", "Orlando", "Jacksonville", "St. Petersburg", "Hialeah", "Fort Lauderdale", "Tallahassee", "Port St. Lucie", "Cape Coral"],
                    
                    // Canada
                    "Ontario": ["Toronto", "Ottawa", "Mississauga", "Hamilton", "Brampton", "London", "Markham", "Windsor", "Kitchener", "Vaughan"],
                    "British Columbia": ["Vancouver", "Victoria", "Surrey", "Burnaby", "Richmond", "Abbotsford", "Coquitlam", "Kelowna", "Saanich", "Delta"],
                    "Quebec": ["Montreal", "Quebec City", "Laval", "Gatineau", "Longueuil", "Sherbrooke", "Saguenay", "Lévis", "Trois-Rivières", "Terrebonne"],
                    
                    // India
                    "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Thane", "Nashik", "Aurangabad", "Solapur", "Dhule", "Amravati", "Malegaon"],
                    "Karnataka": ["Bangalore", "Mysore", "Hubli", "Mangalore", "Belgaum", "Gulbarga", "Davanagere", "Bellary", "Bijapur", "Shimoga"],
                    "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tirunelveli", "Tiruppur", "Erode", "Vellore", "Thoothukudi"],
                    
                    // Australia
                    "New South Wales": ["Sydney", "Newcastle", "Wollongong", "Broken Hill", "Dubbo", "Albury", "Tamworth", "Orange", "Bathurst", "Wagga Wagga"],
                    "Victoria": ["Melbourne", "Geelong", "Ballarat", "Bendigo", "Shepparton", "Wodonga", "Warrnambool", "Traralgon", "Mildura", "Horsham"],
                    "Queensland": ["Brisbane", "Gold Coast", "Townsville", "Cairns", "Toowoomba", "Rockhampton", "Mackay", "Bundaberg", "Gladstone", "Hervey Bay"],
                    
                    // Sri Lanka (Enhanced for the current test case)
                    "Colombo District": ["Colombo", "Sri Jayawardenepura Kotte", "Dehiwala-Mount Lavinia", "Moratuwa", "Kesbewa", "Maharagama", "Kotte", "Battaramulla", "Rajagiriya", "Nugegoda"],
                    "Gampaha District": ["Gampaha", "Negombo", "Katunayake", "Ja-Ela", "Wattala", "Kelaniya", "Peliyagoda", "Ragama", "Kandana", "Minuwangoda"],
                    "Kalutara District": ["Kalutara", "Panadura", "Horana", "Beruwala", "Aluthgama", "Matugama", "Wadduwa", "Bandaragama", "Ingiriya", "Bulathsinhala"],
                    "Kandy District": ["Kandy", "Gampola", "Nawalapitiya", "Wattegama", "Harispattuwa", "Pathadumbara", "Udunuwara", "Yatinuwara", "Akurana", "Kadugannawa"],
                    "Galle District": ["Galle", "Hikkaduwa", "Ambalangoda", "Elpitiya", "Bentota", "Baddegama", "Yakkalamulla", "Imaduwa", "Neluwa", "Nagoda"],
                    
                    // Brazil
                    "São Paulo": ["São Paulo", "Guarulhos", "Campinas", "São Bernardo do Campo", "São José dos Campos", "Santo André", "Ribeirão Preto", "Osasco", "Sorocaba", "Mauá"],
                    "Rio de Janeiro": ["Rio de Janeiro", "São Gonçalo", "Duque de Caxias", "Nova Iguaçu", "Niterói", "Belford Roxo", "São João de Meriti", "Campos dos Goytacazes", "Petrópolis", "Volta Redonda"],
                    
                    // Germany  
                    "Bavaria": ["Munich", "Nuremberg", "Augsburg", "Würzburg", "Regensburg", "Ingolstadt", "Fürth", "Erlangen", "Bayreuth", "Bamberg"],
                    "North Rhine-Westphalia": ["Cologne", "Düsseldorf", "Dortmund", "Essen", "Duisburg", "Bochum", "Wuppertal", "Bonn", "Bielefeld", "Münster"],
                    
                    // Mexico
                    "Jalisco": ["Guadalajara", "Zapopan", "Tlaquepaque", "Tonalá", "Puerto Vallarta", "Tlajomulco de Zúñiga", "El Salto", "Chapala", "Ocotlán", "Lagos de Moreno"],
                    "México": ["Ecatepec", "Guadalajara", "Puebla", "Tijuana", "León", "Juárez", "Torreón", "Querétaro", "San Luis Potosí", "Mérida"]
                };
                
                string[] cities = fallbackCities.hasKey(stateValue) ? (fallbackCities[stateValue] ?: ["No cities available"]) : ["No cities available"];
                json citiesData = {"data": cities};
                
                http:Response res = new;
                res.setHeader("Access-Control-Allow-Origin", "*");
                res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
                res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
                res.setHeader("Content-Type", "application/json");
                res.setJsonPayload({
                    success: true,
                    data: citiesData,
                    message: "Cities fetched successfully (enhanced fallback data)"
                });
                return res;
            }
        }

        return createErrorResponse(400, "Invalid location request - country and state required");
    }

    // ENHANCED SEARCH WITH LOCATION
    resource function options search/location(http:Request req) returns http:Response {
        http:Response res = new;
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        res.statusCode = 204;
        return res;
    }

    resource function post search/location(@http:Payload json searchReq) returns http:Response|error {
        // Add debugging
        log:printInfo("🔍 Received location-based search request: " + searchReq.toString());
        
        if searchReq is map<json> {
            string medicineName = "";
            string location = "";
            string country = "";
            string state = "";
            string city = "";

            if searchReq.hasKey("medicineName") {
                anydata medValue = searchReq["medicineName"];
                if medValue is string {
                    medicineName = medValue;
                }
            }

            if searchReq.hasKey("location") {
                anydata locValue = searchReq["location"];
                if locValue is string {
                    location = locValue;
                }
            }

            if searchReq.hasKey("country") {
                anydata countryValue = searchReq["country"];
                if countryValue is string {
                    country = countryValue;
                }
            }

            if searchReq.hasKey("state") {
                anydata stateValue = searchReq["state"];
                if stateValue is string {
                    state = stateValue;
                }
            }

            if searchReq.hasKey("city") {
                anydata cityValue = searchReq["city"];
                if cityValue is string {
                    city = cityValue;
                }
            }

            // Build location search query based on provided parameters
            string locationQuery = "";
            if city != "" {
                locationQuery = city;
            } else if state != "" {
                locationQuery = state;
            } else if country != "" {
                locationQuery = country;
            } else if location != "" {
                locationQuery = location;
            }

            log:printInfo("🏥 Medicine search params - Name: '" + medicineName + "', Location: '" + locationQuery + "'");

            // STEP 1: First find pharmacies that match the location
            string pharmacySearchQuery = "/rest/v1/pharmacies?select=id,name,phone,email,address,license_number";
            if locationQuery != "" {
                pharmacySearchQuery = pharmacySearchQuery + "&address=ilike.*" + locationQuery + "*";
            }

            log:printInfo("📊 Step 1 - Pharmacy location query: " + pharmacySearchQuery);

            http:Response pharmacyResponse = check supabaseClient->get(pharmacySearchQuery, {
                "Authorization": "Bearer " + supabaseKey,
                "apikey": supabaseKey,
                "Content-Type": "application/json"
            });

            if pharmacyResponse.statusCode != 200 {
                return createErrorResponse(500, "Failed to search pharmacies in database");
            }

            json pharmaciesData = check pharmacyResponse.getJsonPayload();
            
            if pharmaciesData is json[] && pharmaciesData.length() == 0 {
                log:printInfo("❌ No pharmacies found in location: " + locationQuery);
                json responseBody = {
                    medicines: [],
                    totalCount: 0,
                    searchTerm: medicineName,
                    location: locationQuery,
                    searchParams: {
                        country: country,
                        state: state,
                        city: city,
                        location: location
                    },
                    message: "No pharmacies found in the specified location",
                    dataSource: "Supabase Database with Location Filter"
                };

                http:Response res = new;
                res.setHeader("Access-Control-Allow-Origin", "*");
                res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
                res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
                res.setHeader("Content-Type", "application/json");
                res.setJsonPayload(responseBody);
                return res;
            }

            // Extract pharmacy IDs for medicine search
            string[] pharmacyIds = [];
            json[] pharmaciesArray = [];
            if pharmaciesData is json[] {
                foreach json pharmacy in pharmaciesData {
                    if pharmacy is map<json> && pharmacy.hasKey("id") {
                        anydata idValue = pharmacy["id"];
                        if idValue is string {
                            pharmacyIds.push(idValue);
                        }
                    }
                    pharmaciesArray.push(pharmacy);
                }
            }

            log:printInfo("🏪 Found " + pharmacyIds.length().toString() + " pharmacies in location");

            if pharmacyIds.length() == 0 {
                log:printInfo("❌ No valid pharmacy IDs found");
                json responseBody = {
                    medicines: [],
                    totalCount: 0,
                    searchTerm: medicineName,
                    location: locationQuery,
                    searchParams: {
                        country: country,
                        state: state,
                        city: city,
                        location: location
                    },
                    message: "No valid pharmacies found in the specified location",
                    dataSource: "Supabase Database with Location Filter"
                };

                http:Response res = new;
                res.setHeader("Access-Control-Allow-Origin", "*");
                res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
                res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
                res.setHeader("Content-Type", "application/json");
                res.setJsonPayload(responseBody);
                return res;
            }

            // STEP 2: Now find medicines that match the name AND belong to these pharmacies
            string pharmacyIdFilter = "pharmacy_id.in.(" + string:'join(",", ...pharmacyIds) + ")";
            string medicineSearchQuery = "/rest/v1/medicines?name=ilike.*" + medicineName + "*&" + pharmacyIdFilter + "&select=*";

            log:printInfo("📊 Step 2 - Medicine query: " + medicineSearchQuery);

            http:Response medicineResponse = check supabaseClient->get(medicineSearchQuery, {
                "Authorization": "Bearer " + supabaseKey,
                "apikey": supabaseKey,
                "Content-Type": "application/json"
            });

            if medicineResponse.statusCode != 200 {
                return createErrorResponse(500, "Failed to search medicines in database");
            }

            json medicinesData = check medicineResponse.getJsonPayload();
            
            // STEP 3: Combine medicine data with their corresponding pharmacy data
            json[] enhancedMedicines = [];
            if medicinesData is json[] {
                foreach json medicine in medicinesData {
                    if medicine is map<json> && medicine.hasKey("pharmacy_id") {
                        anydata pharmacyIdValue = medicine["pharmacy_id"];
                        if pharmacyIdValue is string {
                            // Find the matching pharmacy
                            foreach json pharmacy in pharmaciesArray {
                                if pharmacy is map<json> && pharmacy.hasKey("id") {
                                    anydata pharmaIdCheck = pharmacy["id"];
                                    if pharmaIdCheck is string && pharmaIdCheck == pharmacyIdValue {
                                        // Add pharmacy data to medicine
                                        map<json> enhancedMedicine = <map<json>>medicine.clone();
                                        enhancedMedicine["pharmacies"] = [pharmacy]; // Array format for frontend
                                        enhancedMedicines.push(enhancedMedicine);
                                        break;
                                    }
                                }
                            }
                        }
                    }
                }
            }

            int totalCount = enhancedMedicines.length();
            log:printInfo("✅ Enhanced search results: " + totalCount.toString() + " medicines found with pharmacy data");

            json responseBody = {
                medicines: enhancedMedicines,
                totalCount: totalCount,
                searchTerm: medicineName,
                location: locationQuery,
                searchParams: {
                    country: country,
                    state: state,
                    city: city,
                    location: location
                },
                message: totalCount > 0 ? "Location-based search completed successfully" : "No medicines found matching '" + medicineName + "' in " + locationQuery,
                dataSource: "Supabase Database with Enhanced Location-Medicine Matching",
                pharmaciesFound: pharmacyIds.length(),
                medicinesFound: totalCount
            };

            http:Response res = new;
            res.setHeader("Access-Control-Allow-Origin", "*");
            res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
            res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
            res.setHeader("Content-Type", "application/json");
            res.setJsonPayload(responseBody);
            return res;
        }

        return createErrorResponse(400, "Invalid search request");
    }

    // PHARMACY INFO
    resource function options pharmacyInfo(http:Request req) returns http:Response {
        http:Response res = new;
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        res.statusCode = 204;
        return res;
    }

    resource function get pharmacyInfo(http:Request req) returns http:Response|error {
        string|http:HeaderNotFoundError authHeader = req.getHeader("Authorization");
        string? pharmacyId = validateToken(authHeader is string ? authHeader : ());
        
        if pharmacyId is () {
            return createErrorResponse(401, "Unauthorized access");
        }

        // Get pharmacy info from Supabase
        http:Response response = check supabaseClient->get("/rest/v1/pharmacies?id=eq." + pharmacyId, {
            "Authorization": "Bearer " + supabaseKey,
            "apikey": supabaseKey,
            "Content-Type": "application/json"
        });

        if response.statusCode != 200 {
            return createErrorResponse(500, "Failed to fetch pharmacy info from database");
        }

        json pharmacies = check response.getJsonPayload();
        if pharmacies is json[] && pharmacies.length() > 0 {
            json pharmacy = pharmacies[0];
            
            http:Response res = new;
            res.setHeader("Access-Control-Allow-Origin", "*");
            res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
            res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
            res.setHeader("Content-Type", "application/json");
            res.setJsonPayload({
                success: true,
                pharmacy: pharmacy,
                message: "Pharmacy info fetched successfully from Supabase"
            });
            return res;
        }

        return createErrorResponse(404, "Pharmacy not found");
    }

    resource function put pharmacyInfo(@http:Payload json updateReq, http:Request req) returns http:Response|error {
        string|http:HeaderNotFoundError authHeader = req.getHeader("Authorization");
        string? pharmacyId = validateToken(authHeader is string ? authHeader : ());
        
        if pharmacyId is () {
            return createErrorResponse(401, "Unauthorized access");
        }

        if updateReq is map<json> {
            // Build update object with only provided fields
            map<json> updateData = {};
            
            if updateReq.hasKey("name") {
                updateData["name"] = updateReq["name"];
            }
            if updateReq.hasKey("email") {
                updateData["email"] = updateReq["email"];
            }
            if updateReq.hasKey("phone") {
                updateData["phone"] = updateReq["phone"];
            }
            // Handle address field
            if updateReq.hasKey("address") {
                updateData["address"] = updateReq["address"];
            }
            if updateReq.hasKey("license_number") {
                updateData["license_number"] = updateReq["license_number"];
            }
            if updateReq.hasKey("profile_image") {
                updateData["profile_image"] = updateReq["profile_image"];
            }
            if updateReq.hasKey("description") {
                updateData["description"] = updateReq["description"];
            }

            log:printInfo("Updating pharmacy " + pharmacyId + " with data: " + updateData.toString());

            // Update in Supabase
            http:Response response = check supabaseClient->patch("/rest/v1/pharmacies?id=eq." + pharmacyId, updateData, {
                "Authorization": "Bearer " + supabaseKey,
                "apikey": supabaseKey,
                "Content-Type": "application/json",
                "Prefer": "return=representation"
            });

            if response.statusCode != 200 {
                json|error errorPayload = response.getJsonPayload();
                string errorMsg = "Unknown error";
                if errorPayload is json {
                    errorMsg = errorPayload.toString();
                }
                log:printError("Supabase update failed: " + errorMsg);
                return createErrorResponse(500, "Failed to update pharmacy info: " + errorMsg);
            }

            json|error updatedPharmacy = response.getJsonPayload();
            if updatedPharmacy is error {
                log:printError("Failed to parse updated pharmacy: " + updatedPharmacy.message());
                return createErrorResponse(500, "Update successful but failed to retrieve updated data");
            }

            http:Response res = new;
            res.setHeader("Access-Control-Allow-Origin", "*");
            res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
            res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
            res.setHeader("Content-Type", "application/json");
            res.setJsonPayload({
                success: true,
                pharmacy: updatedPharmacy,
                message: "Pharmacy info updated successfully"
            });
            return res;
        }

        return createErrorResponse(400, "Invalid update data");
    }

    // PROFILE IMAGE UPLOAD ENDPOINT
    resource function options uploadProfileImage(http:Request req) returns http:Response {
        http:Response res = new;
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        res.statusCode = 204;
        return res;
    }

    resource function post uploadProfileImage(http:Request req) returns http:Response|error {
        string|http:HeaderNotFoundError authHeader = req.getHeader("Authorization");
        string? pharmacyId = validateToken(authHeader is string ? authHeader : ());
        
        if pharmacyId is () {
            return createErrorResponse(401, "Unauthorized access");
        }

        // Get the image data from request body
        json|error payload = req.getJsonPayload();
        if payload is error {
            return createErrorResponse(400, "Invalid image data");
        }

        if payload is map<json> && payload.hasKey("profile_image") {
            string imageUrl = payload["profile_image"].toString();
            
            // Update pharmacy profile_image in Supabase
            map<json> updateData = {
                "profile_image": imageUrl
            };

            http:Response response = check supabaseClient->patch("/rest/v1/pharmacies?id=eq." + pharmacyId, updateData, {
                "Authorization": "Bearer " + supabaseKey,
                "apikey": supabaseKey,
                "Content-Type": "application/json",
                "Prefer": "return=representation"
            });

            if response.statusCode != 200 {
                return createErrorResponse(500, "Failed to update profile image");
            }

            json|error updatedPharmacy = response.getJsonPayload();
            if updatedPharmacy is error {
                return createErrorResponse(500, "Failed to retrieve updated pharmacy data");
            }

            http:Response res = new;
            res.setHeader("Access-Control-Allow-Origin", "*");
            res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
            res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
            res.setHeader("Content-Type", "application/json");
            res.setJsonPayload({
                success: true,
                pharmacy: updatedPharmacy,
                message: "Profile image updated successfully"
            });
            return res;
        }

        return createErrorResponse(400, "Missing profile_image in request");
    }

    // PHARMACY SETTINGS ENDPOINTS
    resource function options pharmacySettings(http:Request req) returns http:Response {
        http:Response res = new;
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        res.statusCode = 204;
        return res;
    }

    resource function get pharmacySettings(http:Request req) returns http:Response|error {
        string|error authHeaderResult = req.getHeader("Authorization");
        string? authHeader = authHeaderResult is string ? authHeaderResult : ();
        string? pharmacyId = validateToken(authHeader);
        
        if pharmacyId is () {
            return createErrorResponse(401, "Invalid or missing token");
        }

        // Get pharmacy settings from Supabase
        http:Response response = check supabaseClient->get("/rest/v1/pharmacy_settings?pharmacy_id=eq." + pharmacyId, {
            "Authorization": "Bearer " + supabaseKey,
            "apikey": supabaseKey
        });

        json|error payload = response.getJsonPayload();
        if payload is error {
            log:printError("Failed to parse settings response: " + payload.message());
            return createErrorResponse(500, "Failed to retrieve settings");
        }

        json[] settings = <json[]>payload;
        json defaultSettings = {
            pharmacy_id: pharmacyId,
            email_notifications: true,
            sms_notifications: false,
            opening_time: "09:00",
            closing_time: "21:00",
            notification_preferences: {},
            business_hours: {}
        };

        json currentSettings = settings.length() > 0 ? settings[0] : defaultSettings;

        http:Response res = new;
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");  
        res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        res.setHeader("Content-Type", "application/json");
        res.setJsonPayload({
            success: true,
            settings: currentSettings
        });
        return res;
    }

    resource function put pharmacySettings(@http:Payload json settingsReq, http:Request req) returns http:Response|error {
        string|error authHeaderResult = req.getHeader("Authorization");
        string? authHeader = authHeaderResult is string ? authHeaderResult : ();
        string? pharmacyId = validateToken(authHeader);
        
        if pharmacyId is () {
            return createErrorResponse(401, "Invalid or missing token");
        }

        if settingsReq is map<json> {
            map<json> updateData = {};
            updateData["pharmacy_id"] = pharmacyId;

            if settingsReq.hasKey("email_notifications") {
                updateData["email_notifications"] = settingsReq["email_notifications"];
            }
            if settingsReq.hasKey("sms_notifications") {
                updateData["sms_notifications"] = settingsReq["sms_notifications"];
            }
            if settingsReq.hasKey("opening_time") {
                updateData["opening_time"] = settingsReq["opening_time"];
            }
            if settingsReq.hasKey("closing_time") {
                updateData["closing_time"] = settingsReq["closing_time"];
            }
            if settingsReq.hasKey("notification_preferences") {
                updateData["notification_preferences"] = settingsReq["notification_preferences"];
            }
            if settingsReq.hasKey("business_hours") {
                updateData["business_hours"] = settingsReq["business_hours"];
            }

            // First try to update existing settings
            http:Response response = check supabaseClient->patch("/rest/v1/pharmacy_settings?pharmacy_id=eq." + pharmacyId, updateData, {
                "Authorization": "Bearer " + supabaseKey,
                "apikey": supabaseKey,
                "Content-Type": "application/json",
                "Prefer": "return=representation"
            });

            // If no rows affected (404), insert new settings
            if response.statusCode == 200 {
                json|error updatedSettings = response.getJsonPayload();
                if updatedSettings is json {
                    json[] settingsArray = <json[]>updatedSettings;
                    
                    if settingsArray.length() == 0 {
                        // Insert new settings
                        updateData["id"] = uuid:createType4AsString();
                        response = check supabaseClient->post("/rest/v1/pharmacy_settings", updateData, {
                            "Authorization": "Bearer " + supabaseKey,
                            "apikey": supabaseKey,
                            "Content-Type": "application/json",
                            "Prefer": "return=representation"
                        });
                    }
                }
            }

            if response.statusCode != 200 && response.statusCode != 201 {
                json|error errorPayload = response.getJsonPayload();
                string errorMsg = "Unknown error";
                if errorPayload is json {
                    errorMsg = errorPayload.toString();
                }
                log:printError("Supabase settings update failed: " + errorMsg);
                return createErrorResponse(500, "Failed to update settings: " + errorMsg);
            }

            json|error updatedSettings = response.getJsonPayload();
            if updatedSettings is error {
                log:printError("Failed to parse updated settings: " + updatedSettings.message());
                return createErrorResponse(500, "Update successful but failed to retrieve updated data");
            }

            http:Response res = new;
            res.setHeader("Access-Control-Allow-Origin", "*");
            res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
            res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
            res.setHeader("Content-Type", "application/json");
            res.setJsonPayload({
                success: true,
                settings: updatedSettings,
                message: "Settings updated successfully"
            });
            return res;
        }

        return createErrorResponse(400, "Invalid settings data");
    }
}

// UTILITY FUNCTIONS
function validateToken(string? authHeader) returns string? {
    if authHeader is () {
        return ();
    }
    
    if !authHeader.startsWith("Bearer ") {
        return ();
    }
    
    string token = authHeader.substring(7);
    
    // Extract pharmacy ID from token format: mh_PHARMACY_ID_UUID
    if token.startsWith("mh_") {
        string[] parts = regex:split(token, "_");
        if parts.length() >= 3 {
            return parts[1]; // Return the pharmacy ID part
        }
    }
    
    return ();
}

function generateSessionToken(string pharmacyId) returns string {
    return "mh_" + pharmacyId + "_" + uuid:createType4AsString();
}

function createErrorResponse(int statusCode, string message) returns http:Response {
    http:Response res = new;
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Content-Type", "application/json");
    res.statusCode = statusCode;
    res.setJsonPayload({
        success: false,
        message: message,
        timestamp: time:utcNow()
    });
    return res;
}
