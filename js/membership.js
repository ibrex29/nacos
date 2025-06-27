document.addEventListener('DOMContentLoaded', function() {
    const membershipForm = document.getElementById('membershipForm');
    
    if (membershipForm) {
        membershipForm.addEventListener('submit', handleMembershipSubmission);
    }
});

async function handleMembershipSubmission(e) {
    e.preventDefault();
    
    // Get form data
    const formData = new FormData(e.target);
    const membershipData = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        about: formData.get('about'),
        motivation: formData.get('motivation'),
        visionForChange: formData.get('visionForChange'), // Fixed the duplicate ID issue
        membershipType: formData.get('membershipType'),
        message: formData.get('message'),
        status: 'pending', // Default status for new applications
        applicationDate: new Date().toISOString()
    };
    
    // Validate required fields
    if (!membershipData.name || !membershipData.email || !membershipData.phone || !membershipData.motivation || !membershipData.membershipType) {
        FirebaseUtils.showError('Please fill in all required fields.');
        return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(membershipData.email)) {
        FirebaseUtils.showError('Please enter a valid email address.');
        return;
    }
    
    // Show loading state
    const submitButton = e.target.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.innerHTML;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
    submitButton.disabled = true;
    
    try {
        // Add membership application to Firestore
        const result = await FirebaseUtils.addDocument('members', membershipData);
        
        if (result.success) {
            FirebaseUtils.showSuccess('Your membership application has been submitted successfully! We will contact you soon.');
            
            // Reset form
            e.target.reset();
            
            // Optional: Send email notification (you'd need to set up Cloud Functions for this)
            console.log('Membership application submitted with ID:', result.id);
            
        } else {
            throw new Error(result.error);
        }
        
    } catch (error) {
        console.error('Error submitting membership application:', error);
        FirebaseUtils.showError('There was an error submitting your application. Please try again.');
        
    } finally {
        // Reset button state
        submitButton.innerHTML = originalButtonText;
        submitButton.disabled = false;
    }
}

// Optional: Function to check if email already exists (to prevent duplicates)
async function checkExistingEmail(email) {
    try {
        const snapshot = await db.collection('membership_applications')
            .where('email', '==', email)
            .get();
        
        return !snapshot.empty;
    } catch (error) {
        console.error('Error checking existing email:', error);
        return false;
    }
}